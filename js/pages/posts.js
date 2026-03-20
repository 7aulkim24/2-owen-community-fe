import { get, post, handleApiError, handleApiSuccess, getFullImageUrl } from '../api.js';
import { buildPostCard } from '../utils/card-builder.js';

// DOM 요소
const postList = document.getElementById('post-list');
let currentOffset = 0;
const LIMIT = 10;
let isLoading = false;
let hasNext = true;
let currentUser = null;
let infiniteScrollObserver = null;
let currentPostType = 'all';
let loadId = 0;

try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
    }
} catch (e) {
    console.error('Failed to parse user from localStorage', e);
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
async function loadPosts(append = false) {
    if (isLoading || (!hasNext && append)) return;
    
    isLoading = true;
    const thisLoadId = ++loadId;

    try {
        const queryOpts = {
            offset: currentOffset,
            limit: LIMIT
        };
        if (currentPostType !== 'all') {
            queryOpts.post_type = currentPostType;
        }
        const params = new URLSearchParams(queryOpts);
        const response = await get(`/v1/posts?${params}`);

        if (thisLoadId !== loadId) return;

        const items = response?.data?.items || [];
        const pagination = response?.data?.pagination || null;

        renderPosts(items, append);

        currentOffset += LIMIT;
        // 백엔드 메타데이터를 우선 사용, 없을 경우에만 false로 fallback
        hasNext = pagination?.hasNext ?? false;
        if (!hasNext && infiniteScrollObserver) {
            infiniteScrollObserver.disconnect();
        }
    } catch (error) {
        if (thisLoadId === loadId) handleApiError(error);
    } finally {
        if (thisLoadId === loadId) isLoading = false;
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
function resetAndReload() {
    loadId++;
    currentOffset = 0;
    hasNext = true;
    postList.innerHTML = '';
    if (infiniteScrollObserver) {
        infiniteScrollObserver.disconnect();
    }
    loadPosts(false);
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
    // 헤더 프로필 드롭다운
    const headerProfileBtn = document.getElementById('header-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (headerProfileBtn && profileDropdown) {
        headerProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

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

    // 헤더 프로필 정보 업데이트 및 로그아웃 처리
    if (headerProfileBtn && currentUser) {
        const headerProfileImg = headerProfileBtn.querySelector('img');
        if (headerProfileImg && currentUser.profileImageUrl) {
            headerProfileImg.src = getFullImageUrl(currentUser.profileImageUrl);
        }
    }

    const logoutBtn = document.getElementById('logout-btn') || document.getElementById('logout-link');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await post('/v1/auth/logout');
                handleApiSuccess(response, {
                    modal: true,
                    title: '로그아웃',
                    code: 'LOGOUT_SUCCESS',
                    onConfirm: () => {
                        localStorage.removeItem('user');
                        window.location.replace('/login.html');
                    }
                });
            } catch (error) {
                handleApiError(error);
                localStorage.removeItem('user');
                window.location.replace('/login.html');
            }
        });
    }

    // 인피니티 스크롤 초기화
    setupInfiniteScroll();
});
