// import { request } from '../api.js';

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
 * 날짜 포맷팅
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * URL 파라미터에서 게시글 ID 추출
 */
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || '1';
}

/**
 * 더미 게시글 데이터 생성
 */
function getDummyPost(postId) {
    return {
        postId: postId,
        title: `제목 ${postId} - 게시글 상세 페이지 UI 확인을 위한 더미 제목입니다.`,
        content: `무엇을 얘기할까요? 아무말이라면, 삶은 항상 놀라운 모험이라고 생각합니다. 우리는 매일 새로운 경험을 하고 배우며 성장합니다. 때로는 어려움과 도전이 있지만, 그것들이 우리를 더 강하고 지혜롭게 만듭니다. 또한 우리는 주변의 사람들과 연결되며 사랑과 지지를 받습니다. 그래서 우리의 삶은 소중하고 의미가 있습니다. \n\n자연도 아름다운 이야기입니다. 우리 주변의 자연은 끝없는 아름다움과 신비로움을 담고 있습니다. 산, 바다, 숲, 하늘 등 모든 것이 우리를 놀라게 만들고 감동시킵니다. 자연은 우리의 생명과 안정을 지키며 우리에게 힘을 주는 곳입니다. \n\n마지막으로, 지식을 향한 탐구는 항상 흥미로운 여정입니다. 우리는 끝없는 지식의 바다에서 배우고 발견할 수 있으며, 이것이 우리를 더 깊이 이해하고 세상을 더 넓게 보게 해줍니다. \n\n그런 의미에서, 삶은 놀라움과 경이로움으로 가득 차 있습니다. 새로운 경험을 즐기고 항상 앞으로 나아가는 것이 중요하다고 생각합니다.`,
        likeCount: 1234,
        commentCount: 5,
        viewCount: 9999,
        isLiked: false,
        createdAt: new Date().toISOString(),
        author: {
            nickname: `작성자 ${postId}`,
            profileImageUrl: './assets/default-profile.png'
        }
    };
}

/**
 * 더미 댓글 데이터 생성
 */
function getDummyComments() {
    return [
        {
            commentId: '1',
            content: '정말 유익한 글이네요! 잘 읽었습니다.',
            createdAt: new Date().toISOString(),
            author: {
                nickname: '댓글러1',
                profileImageUrl: './assets/default-profile.png'
            }
        },
        {
            commentId: '2',
            content: '디자인이 깔끔하고 보기 좋습니다.',
            createdAt: new Date().toISOString(),
            author: {
                nickname: '디자이너킴',
                profileImageUrl: './assets/default-profile.png'
            }
        },
        {
            commentId: '3',
            content: '이 부분은 조금 더 설명이 필요한 것 같아요.',
            createdAt: new Date().toISOString(),
            author: {
                nickname: '질문러',
                profileImageUrl: './assets/default-profile.png'
            }
        }
    ];
}

/**
 * 게시글 데이터 렌더링
 */
function renderPost(post) {
    const postDetail = document.querySelector('.post-detail');
    if (!postDetail) return;

    // 제목
    const titleElement = postDetail.querySelector('.post-detail-title');
    if (titleElement) titleElement.textContent = post.title;

    // 작성자 정보
    const authorImg = postDetail.querySelector('.author-img img');
    const authorName = postDetail.querySelector('.author-name');
    const postDate = postDetail.querySelector('.post-date');

    if (authorImg) authorImg.src = post.author.profileImageUrl || './assets/default-profile.png';
    if (authorName) authorName.textContent = post.author.nickname;
    if (postDate) postDate.textContent = formatDate(post.createdAt);

    // 게시글 내용
    const postText = postDetail.querySelector('.post-text');
    if (postText) postText.textContent = post.content;

    // 통계 정보
    const likeCount = document.querySelector('.stat-box#btn-like .stat-count');
    const commentCount = document.querySelector('.stat-box#btn-comment .stat-count');
    const viewCount = document.querySelector('.stat-box#btn-view .stat-count');

    if (likeCount) likeCount.textContent = formatCount(post.likeCount || 0);
    if (commentCount) commentCount.textContent = formatCount(post.commentCount || 0);
    if (viewCount) viewCount.textContent = formatCount(post.viewCount || 0);

    // 좋아요 상태
    const likeBtn = document.getElementById('btn-like');
    if (likeBtn) {
        likeBtn.classList.toggle('active', post.isLiked);
    }
}

/**
 * 댓글 목록 렌더링
 */
function renderComments(comments) {
    const commentListSection = document.querySelector('.comment-list-section');
    if (!commentListSection) return;

    if (!comments || comments.length === 0) {
        commentListSection.innerHTML = '<p>댓글이 없습니다. 첫 댓글을 작성해보세요!</p>';
        return;
    }

    const html = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.commentId}">
            <div class="comment-header">
                <div class="comment-author-info">
                    <div class="author-img">
                        <img src="${comment.author.profileImageUrl || './assets/default-profile.png'}" alt="">
                    </div>
                    <div class="author-meta">
                        <span class="comment-author">${comment.author.nickname}</span>
                        <span class="comment-date">${formatDate(comment.createdAt)}</span>
                    </div>
                </div>
                <div class="comment-actions">
                    <button class="btn-action btn-edit-comment" onclick="editComment('${comment.commentId}')">수정</button>
                    <button class="btn-action btn-delete-comment" onclick="deleteComment('${comment.commentId}')">삭제</button>
                </div>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');

    commentListSection.innerHTML = html;
}

/**
 * 게시글 데이터 로드 (더미 사용)
 */
async function loadPost(postId) {
    const post = getDummyPost(postId);
    renderPost(post);
}

/**
 * 댓글 목록 로드 (더미 사용)
 */
async function loadComments(postId) {
    const comments = getDummyComments();
    renderComments(comments);
}

/**
 * 좋아요 토글 (시뮬레이션)
 */
function toggleLike(postId) {
    const likeBtn = document.getElementById('btn-like');
    const likeCount = document.querySelector('.stat-box#btn-like .stat-count');
    
    if (likeBtn) {
        const isActive = likeBtn.classList.toggle('active');
        if (likeCount) {
            let current = parseInt(likeCount.textContent.replace('k', '000'));
            likeCount.textContent = formatCount(isActive ? current + 1 : current - 1);
        }
    }
}

/**
 * 게시글 삭제 (시뮬레이션)
 */
function deletePost(postId) {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    alert('게시글이 삭제되었습니다.');
    window.location.href = 'posts.html';
}

/**
 * 댓글 작성 (시뮬레이션)
 */
function submitComment(postId) {
    const commentTextarea = document.getElementById('comment-textarea');
    const commentText = commentTextarea.value.trim();

    if (!commentText) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    alert('댓글이 작성되었습니다.');
    commentTextarea.value = '';
    // 실제로는 여기서 서버에 보내고 목록을 새로고침함
}

/**
 * 댓글 삭제 (시뮬레이션)
 */
window.deleteComment = function(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
    if (commentItem) commentItem.remove();
};

window.editComment = function(commentId) {
    alert('댓글 수정 모달이 열립니다.');
};

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    const postId = getPostIdFromUrl();

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

    // 게시글 데이터 로드
    loadPost(postId);
    loadComments(postId);

    // 이벤트 리스너 등록
    const likeBtn = document.getElementById('btn-like');
    const deleteBtn = document.getElementById('btn-delete-post');
    const commentSubmitBtn = document.getElementById('btn-comment-submit');

    if (likeBtn) {
        likeBtn.addEventListener('click', () => toggleLike(postId));
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deletePost(postId));
    }

    if (commentSubmitBtn) {
        commentSubmitBtn.addEventListener('click', () => submitComment(postId));
    }
});
