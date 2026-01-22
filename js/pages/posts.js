// import { request } from '../api.js';

// DOM 요소
const postList = document.getElementById('post-list');
let currentOffset = 0;
const LIMIT = 10;
let isLoading = false;
let hasNext = true;

/**
 * 숫자 포맷팅 (1,000 -> 1k 등)
 */
function formatCount(count) {
    if (count >= 1000) {
        return Math.floor(count / 1000) + 'k';
    }
    return count;
}

/**
 * 더미 데이터 생성 함수
 */
function getDummyPosts(offset, limit) {
    const posts = [];
    for (let i = 1; i <= limit; i++) {
        const id = offset + i;
        posts.push({
            postId: id.toString(),
            title: `제목 ${id} - 게시글 제목이 아주 길어질 경우 26자에서 잘리는지 확인하기 위한 테스트 문구입니다.`,
            content: `게시글 ${id}의 상세 내용입니다. UI/UX 확인을 위한 더미 데이터입니다.`,
            likeCount: Math.floor(Math.random() * 2000),
            commentCount: Math.floor(Math.random() * 500),
            viewCount: Math.floor(Math.random() * 10000),
            createdAt: new Date().toISOString(),
            author: {
                nickname: `작성자 ${id}`,
                profileImageUrl: './assets/default-profile.png'
            }
        });
    }
    return posts;
}

/**
 * 게시글 HTML 생성
 */
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

    return `
        <article class="post-card" onclick="location.href='post-detail.html?id=${post.postId}'">
            <h3 class="post-title">${displayTitle}</h3>
            <div class="post-info">
                <div class="post-stats">
                    <span>좋아요 ${formatCount(post.likeCount || 0)}</span>
                    <span>댓글 ${formatCount(post.commentCount || 0)}</span>
                    <span>조회수 ${formatCount(post.viewCount || 0)}</span>
                </div>
                <div class="post-date">${dateString}</div>
            </div>
            <div class="post-divider"></div>
            <div class="post-author">
                <div class="author-img">
                    <img src="${post.author.profileImageUrl || './assets/default-profile.png'}" alt="">
                </div>
                <span class="author-name">${post.author.nickname}</span>
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
 * 데이터 로드 (더미 데이터 사용으로 수정)
 */
async function loadPosts(append = false) {
    if (isLoading || (!hasNext && append)) return;
    
    isLoading = true;
    
    // 시뮬레이션 로딩 지연
    setTimeout(() => {
        const dummyItems = getDummyPosts(currentOffset, LIMIT);
        renderPosts(dummyItems, append);
        
        // 50개까지만 로드하도록 설정 (테스트용)
        currentOffset += LIMIT;
        hasNext = currentOffset < 50;
        
        isLoading = false;
    }, 500);
}

/**
 * 인피니티 스크롤 처리
 */
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
