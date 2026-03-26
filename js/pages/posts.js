import { get, post, handleApiError, handleApiSuccess, getFullImageUrl, getIntegrations } from '../api.js';
import { buildPostCard } from '../utils/card-builder.js';
import { initHeader } from '../utils/header-init.js';

// DOM 요소
const postList = document.getElementById('post-list');
let currentOffset = 0;
const LIMIT = 10;
let isLoading = false;
let hasNext = true;
let currentUser = null;
let infiniteScrollObserver = null;
let currentPostType = 'all';
const FEED_SORT_KEY = 'prooflogFeedSort';
const FEED_SORT_VALUES = new Set(['published', 'activity']);
let currentSort = 'published';
try {
    const saved = localStorage.getItem(FEED_SORT_KEY);
    if (saved && FEED_SORT_VALUES.has(saved)) currentSort = saved;
} catch (_) {
    /* ignore */
}
let loadId = 0;
/** 동시에 진행 중인 loadPosts 호출 수 (stale 완료 시에도 플래그가 풀리도록 사용) */
let activeLoadRequests = 0;

/** 피드 0건 + 로그인 시 연동 여부에 따른 Empty State (Unit 6) */
function buildFeedEmptyStateHtml(accounts) {
    const hasGithub = Array.isArray(accounts) && accounts.some((a) => a.provider === 'github');
    if (hasGithub) {
        return `
            <div class="feed-empty-state feed-empty-state--waiting">
                <h2 class="feed-empty-state__title">첫 수집까지 기다리는 중…</h2>
                <p class="feed-empty-state__text">GitHub 활동이 수집되면 <strong>Records</strong>에서 초안을 확인할 수 있습니다. 연동 관리에서 <strong>지금 동기화</strong>로 즉시 불러올 수도 있어요.</p>
                <div class="feed-empty-state__actions">
                    <a href="/integration.html" class="feed-empty-state__link">연동 관리로 이동</a>
                    <a href="/drafts.html" class="feed-empty-state__link">초안 목록 보기</a>
                </div>
            </div>
        `;
    }
    return `
        <div class="feed-empty-state feed-empty-state--onboard">
            <h2 class="feed-empty-state__title">아직 기록이 없습니다</h2>
            <p class="feed-empty-state__text">GitHub을 연동하면 커밋·PR·이슈 활동이 자동으로 수집되어 하루 작업 로그 초안이 만들어집니다.</p>
            <div class="feed-empty-state__actions">
                <a href="/integration.html" class="feed-empty-state__btn">GitHub 연동하기</a>
                <a href="/make-post.html" class="feed-empty-state__link">또는 직접 글 쓰기</a>
            </div>
        </div>
    `;
}

// 게시글 렌더링
function renderPosts(posts, append = false) {
    if (!posts || posts.length === 0) {
        if (!append) {
            postList.innerHTML = '<p class="error">게시글이 없습니다. 첫 글을 작성해보세요!</p>';
        }
        return;
    }

    const html = posts.map(post => buildPostCard(post, getFullImageUrl)).join('');
    if (append) {
        postList.insertAdjacentHTML('beforeend', html);
    } else {
        postList.innerHTML = html;
    }
}

// 데이터 로드
// force: 필터 전환 등 — 이전 요청이 진행 중이어도 새 목록 로드를 시작해야 함(연속 클릭 시 loadId만 올라가고 fetch가 스킵되는 버그 방지)
async function loadPosts(append = false, force = false) {
    if (!force && (isLoading || (!hasNext && append))) return;

    isLoading = true;
    activeLoadRequests += 1;
    const thisLoadId = ++loadId;

    try {
        const queryOpts = {
            offset: currentOffset,
            limit: LIMIT,
            sort: currentSort
        };
        if (currentPostType !== 'all') {
            queryOpts.post_type = currentPostType;
        }
        const params = new URLSearchParams(queryOpts);
        const response = await get(`/v1/posts?${params}`);

        if (thisLoadId !== loadId) return;

        const items = response?.data?.items || [];
        const pagination = response?.data?.pagination || null;

        if (items.length === 0 && !append) {
            /* 연동 유도 Empty State는 «전체» 탭 + 로그인일 때만 (필터만 비어 있는 경우 오탐 방지) */
            if (currentUser && currentPostType === 'all') {
                try {
                    const intRes = await getIntegrations();
                    if (thisLoadId !== loadId) return;
                    postList.innerHTML = buildFeedEmptyStateHtml(intRes?.data || []);
                } catch {
                    if (thisLoadId !== loadId) return;
                    postList.innerHTML =
                        '<p class="error">게시글이 없습니다. 첫 글을 작성해보세요!</p>';
                }
            } else {
                postList.innerHTML = '<p class="error">게시글이 없습니다. 첫 글을 작성해보세요!</p>';
            }
        } else {
            renderPosts(items, append);
        }

        if (thisLoadId !== loadId) return;

        currentOffset += LIMIT;
        // 백엔드 메타데이터를 우선 사용, 없을 경우에만 false로 fallback
        hasNext = pagination?.hasNext ?? false;
        if (!hasNext && infiniteScrollObserver) {
            infiniteScrollObserver.disconnect();
        }
    } catch (error) {
        if (thisLoadId === loadId) handleApiError(error);
    } finally {
        activeLoadRequests -= 1;
        if (activeLoadRequests === 0) isLoading = false;
    }
}

// 인피니티 스크롤 처리 (IntersectionObserver 미지원 브라우저용)
function handleScrollFallback() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadPosts(true);
    }
}

// 데이터 초기화 및 재로딩 함수
// loadId는 loadPosts() 시작 시에만 증가 — 여기서 중복 증가 시 연속 필터 클릭 시 세대 불일치로 stale만 남는 문제 발생
function resetAndReload() {
    isLoading = false;
    currentOffset = 0;
    hasNext = true;
    postList.innerHTML = '';
    if (infiniteScrollObserver) {
        infiniteScrollObserver.disconnect();
    }
    loadPosts(false, true);
    setupInfiniteScroll();
}

function setupInfiniteScroll() {
    // HTML에 이미 정의된 sentinel 요소를 사용 (중복 생성 방지)
    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (!sentinel) {
        console.error('infinite-scroll-sentinel element not found in HTML');
        return;
    }

    // 구형 브라우저 fallback
    if (!('IntersectionObserver' in window)) {
        window.addEventListener('scroll', handleScrollFallback);
        return;
    }

    // 이미 observer가 있다면 재사용하지 않고 새로 생성
    if (infiniteScrollObserver) {
        infiniteScrollObserver.disconnect();
    }

    infiniteScrollObserver = new IntersectionObserver(
        (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                loadPosts(true);
            }
        },
        { rootMargin: '200px 0px' }
    );

    infiniteScrollObserver.observe(sentinel);
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 공통 헤더 초기화 (프로필 드롭다운, 로그아웃)
    const { currentUser: user } = initHeader();
    currentUser = user;

    // 초기 데이터 로드
    loadPosts();

    // 필터 탭 이벤트 처리
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // UI 업데이트
            filterTabs.forEach(t => t.classList.remove('active'));
            const targetBtn = e.target.closest('.filter-tab');
            targetBtn.classList.add('active');
            
            // 데이터 업데이트
            currentPostType = targetBtn.dataset.type;
            resetAndReload();
        });
    });

    const sortTabs = document.querySelectorAll('.sort-tab');
    const syncSortTabUi = () => {
        sortTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.sort === currentSort);
        });
    };
    syncSortTabUi();
    sortTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetBtn = e.target.closest('.sort-tab');
            const next = targetBtn?.dataset?.sort;
            if (!next || !FEED_SORT_VALUES.has(next) || next === currentSort) return;
            currentSort = next;
            try {
                localStorage.setItem(FEED_SORT_KEY, currentSort);
            } catch (_) {
                /* ignore */
            }
            syncSortTabUi();
            resetAndReload();
        });
    });
    
    // 게시글 작성 버튼 이벤트 및 권한 제어
    const btnCreate = document.getElementById('btn-create-post');
    if (btnCreate) {
        // 로그인 상태가 아니면 버튼 숨김
        if (!currentUser) {
            btnCreate.style.display = 'none';
        }

        btnCreate.addEventListener('click', () => {
            location.href = '/make-post.html'; 
        });
    }

    // 인피니티 스크롤 초기화
    setupInfiniteScroll();
});
