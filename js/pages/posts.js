import { get, post, handleApiError, handleApiSuccess, getFullImageUrl } from '../api.js';

// DOM 요소
const postList = document.getElementById('post-list');
let currentOffset = 0;
const LIMIT = 10;
let isLoading = false;
let hasNext = true;
let currentUser = null;

try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
    }
} catch (e) {
    console.error('Failed to parse user from localStorage', e);
}

// 숫자 포맷팅 (1,000 -> 1k 등)
function formatCount(count) {
    if (count >= 1000) {
        return Math.floor(count / 1000) + 'k';
    }
    return count;
}

// 게시글 HTML 생성
function createPostHTML(post) {
    // 제목 26자 제한
    const displayTitle = post.title.length > 26 
        ? post.title.substring(0, 26) + '...'
        : post.title;

    // 날짜 포맷팅 (YYYY-MM-DD HH:mm:ss)
    const date = new Date(post.createdAt);
    const dateString = date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const profileImg = getFullImageUrl(post.author.profileImageUrl) || './assets/default-profile.png';

    return `
        <article class="post-card" onclick="location.href='post-detail.html?id=${post.postId}'">
            <h3 class="post-title">${displayTitle}</h3>
            <div class="post-info">
                <div class="post-stats">
                    <span>좋아요 ${formatCount(post.likeCount || 0)}</span>
                    <span>댓글 ${formatCount(post.commentCount || 0)}</span>
                    <span>조회수 ${formatCount(post.hits || 0)}</span>
                </div>
                <div class="post-date">${dateString}</div>
            </div>
            <div class="post-divider"></div>
            <div class="post-author">
                <div class="author-img">
                    <img src="${profileImg}" alt="">
                </div>
                <span class="author-name">${post.author.nickname}</span>
            </div>
        </article>
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

    const html = posts.map(post => createPostHTML(post)).join('');
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

    try {
        const params = new URLSearchParams({
            offset: currentOffset,
            limit: LIMIT
        });
        const response = await get(`/v1/posts?${params}`);
        const items = response?.data?.items || [];
        const pagination = response?.data?.pagination || null;

        renderPosts(items, append);

        currentOffset += LIMIT;
        hasNext = pagination ? pagination.hasNext : items.length === LIMIT;
    } catch (error) {
        handleApiError(error);
    } finally {
        isLoading = false;
    }
}

// 인피니티 스크롤 처리
function handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadPosts(true);
    }
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
    
    // 게시글 작성 버튼 이벤트 및 권한 제어
    const btnCreate = document.getElementById('btn-create-post');
    if (btnCreate) {
        // 로그인 상태가 아니면 버튼 숨김
        if (!currentUser) {
            btnCreate.style.display = 'none';
        }

        btnCreate.addEventListener('click', () => {
            location.href = 'make-post.html'; 
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
                        window.location.href = 'login.html';
                    }
                });
            } catch (error) {
                handleApiError(error);
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }

    // 인피니티 스크롤 이벤트 등록
    window.addEventListener('scroll', handleScroll);
});
