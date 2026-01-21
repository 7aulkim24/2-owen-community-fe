// DOM 요소
const postList = document.getElementById('post-list');
let currentPage = 1;
let isLoading = false;

/**
 * 숫자 포맷팅 (1,000 -> 1k, 10,000 -> 10k, 100,000 -> 100k)
 */
function formatCount(count) {
    if (count >= 100000) {
        return Math.floor(count / 1000) + 'k';
    } else if (count >= 10000) {
        return Math.floor(count / 1000) + 'k';
    } else if (count >= 1000) {
        return Math.floor(count / 1000) + 'k';
    }
    return count;
}

/**
 * 게시글 HTML 생성
 */
function createPostHTML(post) {
    // 제목 26자 제한
    const displayTitle = post.title.length > 26 
        ? post.title.substring(0, 26) 
        : post.title;

    return `
        <article class="post-card" onclick="location.href='post-detail.html?id=${post.id}'">
            <h3 class="post-title">${displayTitle}</h3>
            <div class="post-info">
                <div class="post-stats">
                    <span>좋아요 ${formatCount(post.likes || 0)}</span>
                    <span>댓글 ${formatCount(post.comments || 0)}</span>
                    <span>조회수 ${formatCount(post.views || 0)}</span>
                </div>
                <div class="post-date">${post.created_at}</div>
            </div>
            <div class="post-divider"></div>
            <div class="post-author">
                <div class="author-img">
                    <img src="${post.author_profile || './assets/default-profile.png'}" alt="${post.author_name}">
                </div>
                <span class="author-name">${post.author_name}</span>
            </div>
        </article>
    `;
}

/**
 * 게시글 렌더링
 */
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

/**
 * 더미 데이터 생성 (과제 요구사항 확인용)
 */
function getDummyPosts(page, limit = 10) {
    const posts = [];
    const startIndex = (page - 1) * limit;
    
    for (let i = 1; i <= limit; i++) {
        const id = startIndex + i;
        posts.push({
            id: id,
            title: `제목 ${id} - 게시글 제목이 아주 길어질 경우 26자에서 잘리는지 확인하기 위한 테스트 문구입니다.`,
            likes: 0,
            comments: 0,
            views: 0,
            created_at: "2021-01-01 00:00:00",
            author_name: `더미 작성자 ${id}`,
            author_profile: ""
        });
    }
    return posts;
}

/**
 * 인피니티 스크롤 처리
 */
function handleScroll() {
    if (isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    // 바닥에서 100px 이전에 도달하면 추가 데이터 로드
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMorePosts();
    }
}

async function loadMorePosts() {
    isLoading = true;
    currentPage++;
    
    // 로딩 중 표시 (생략 가능)
    console.log(`Loading page ${currentPage}...`);
    
    // 실제 API 연동 시에는 여기서 fetch 호출
    // 현재는 더미 데이터로 10개씩 추가
    setTimeout(() => {
        const morePosts = getDummyPosts(currentPage);
        renderPosts(morePosts, true);
        isLoading = false;
        
        // 5페이지까지만 로드하도록 제한 (예시)
        if (currentPage >= 5) {
            window.removeEventListener('scroll', handleScroll);
        }
    }, 500);
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

    // 초기 10개 데이터 로드
    const initialPosts = getDummyPosts(1);
    renderPosts(initialPosts);
    
    // 게시글 작성 버튼 이벤트
    const btnCreate = document.getElementById('btn-create-post');
    if (btnCreate) {
        btnCreate.addEventListener('click', () => {
            location.href = 'post-create.html';
        });
    }

    // 인피니티 스크롤 이벤트 등록
    window.addEventListener('scroll', handleScroll);
});
