import { get, post, patch, del, handleApiError, handleApiSuccess, showToast, getFullImageUrl } from '../api.js';

// 상태 관리
let editingCommentId = null;
let deletingCommentId = null;
let currentUser = null;

try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
    }
} catch (e) {
    console.error('Failed to parse user from localStorage', e);
}

/**
 * 커스텀 알림 모달 표시
 * @param {string} title - 모달 제목
 * @param {string} content - 모달 내용
 * @param {function} callback - 확인 버튼 클릭 시 콜백
 */
function showAlert(title, content, callback = null) {
    const modal = document.getElementById('alert-modal');
    const titleEl = document.getElementById('alert-modal-title');
    const contentEl = document.getElementById('alert-modal-content');
    const confirmBtn = modal.querySelector('.btn-confirm');

    if (!modal || !titleEl || !contentEl || !confirmBtn) return;

    titleEl.textContent = title;
    contentEl.textContent = content;
    modal.classList.add('show');

    confirmBtn.onclick = () => {
        modal.classList.remove('show');
        if (callback) callback();
    };
}

// 숫자 포맷팅 (1,000 -> 1k 등)
function formatCount(count) {
    if (count >= 1000) {
        return Math.floor(count / 1000) + 'k';
    }
    return count;
}

// 날짜 포맷팅
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

// URL 파라미터에서 게시글 ID 추출
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 게시글 데이터 렌더링
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

    if (authorImg) authorImg.src = getFullImageUrl(post.author.profileImageUrl) || './assets/default-profile.png';
    if (authorName) authorName.textContent = post.author.nickname;
    if (postDate) postDate.textContent = formatDate(post.createdAt);

    // 게시글 내용
    const postText = postDetail.querySelector('.post-text');
    if (postText) postText.textContent = post.content;

    // 통계 정보
    const likeCount = document.querySelector('.stat-box#btn-like .stat-count');
    const viewCount = document.querySelectorAll('.post-stats-container .stat-box')[1]?.querySelector('.stat-count');
    const commentCount = document.querySelectorAll('.post-stats-container .stat-box')[2]?.querySelector('.stat-count');

    if (likeCount) likeCount.textContent = formatCount(post.likeCount || 0);
    if (viewCount) viewCount.textContent = formatCount(post.hits || 0);
    if (commentCount) commentCount.textContent = formatCount(post.commentCount || 0);

    // 게시글 이미지 캐러셀 렌더링
    const carouselContainer = document.getElementById('post-carousel');
    const carouselImage = carouselContainer?.querySelector('.carousel-image');
    const carouselIndicator = document.getElementById('carousel-indicator');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (post.files && post.files.length > 0) {
        // 이미지가 있을 때 캐러셀 표시
        carouselContainer.style.display = 'block';
        
        // 캐러셀 상태 관리
        let currentImageIndex = 0;
        const totalImages = post.files.length;
        
        // 이미지 표시 함수
        function showImage(index) {
            currentImageIndex = index;
            const imageData = post.files[currentImageIndex];
            if (carouselImage && imageData) {
                carouselImage.src = getFullImageUrl(imageData.imageUrl);
                carouselImage.alt = `게시글 이미지 ${currentImageIndex + 1}/${totalImages}`;
            }
            
            // 인디케이터 업데이트
            if (carouselIndicator) {
                carouselIndicator.textContent = `${currentImageIndex + 1} / ${totalImages}`;
            }
            
            // 버튼 상태 업데이트
            if (prevBtn) prevBtn.disabled = currentImageIndex === 0;
            if (nextBtn) nextBtn.disabled = currentImageIndex === totalImages - 1;
        }
        
        // 이전/다음 버튼 이벤트
        if (prevBtn) {
            prevBtn.onclick = () => {
                if (currentImageIndex > 0) {
                    showImage(currentImageIndex - 1);
                }
            };
        }
        
        if (nextBtn) {
            nextBtn.onclick = () => {
                if (currentImageIndex < totalImages - 1) {
                    showImage(currentImageIndex + 1);
                }
            };
        }
        
        // 이미지 1장일 때 버튼 숨기기
        if (totalImages === 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
        }
        
        // 초기 이미지 표시
        showImage(0);
    } else {
        // 이미지가 없으면 캐러셀 숨김
        carouselContainer.style.display = 'none';
    }

    // 좋아요 상태
    const likeBtn = document.getElementById('btn-like');
    if (likeBtn) {
        likeBtn.classList.toggle('active', Boolean(post.isLiked));
    }

    // 작성자 본인 확인 후 수정/삭제 버튼 제어
    const postActions = document.querySelector('.post-actions');
    if (postActions) {
        const isOwner = currentUser && post.author.userId === currentUser.userId;
        postActions.style.display = isOwner ? 'flex' : 'none';
    }
}

// 댓글 목록 렌더링
function renderComments(comments) {
    const commentListSection = document.querySelector('.comment-list-section');
    if (!commentListSection) return;

    if (!comments || comments.length === 0) {
        commentListSection.innerHTML = '<p>댓글이 없습니다. 첫 댓글을 작성해보세요!</p>';
        return;
    }

    const html = comments.map(comment => {
        const profileImg = getFullImageUrl(comment.author.profileImageUrl) || './assets/default-profile.png';
        return `
            <div class="comment-item" data-comment-id="${comment.commentId}">
                <div class="comment-header">
                    <div class="comment-author-info">
                        <div class="author-img">
                            <img src="${profileImg}" alt="" loading="lazy">
                        </div>
                        <div class="author-meta">
                            <span class="author-name">${comment.author.nickname}</span>
                            <span class="comment-date">${formatDate(comment.createdAt)}</span>
                        </div>
                    </div>
                    ${currentUser && comment.author.userId === currentUser.userId ? `
                    <div class="comment-actions">
                        <button class="btn-action" onclick="editComment('${comment.commentId}')">수정</button>
                        <button class="btn-action" onclick="deleteComment('${comment.commentId}')">삭제</button>
                    </div>
                    ` : ''}
                </div>
                <p class="comment-content">${comment.content}</p>
            </div>
        `;
    }).join('');

    commentListSection.innerHTML = html;
}

// 게시글 데이터 로드
async function loadPost(postId, incHits = true) {
    try {
        const response = await get(`/v1/posts/${postId}?incHits=${incHits}`);
        const post = response?.data;
        if (!post) {
            showAlert('오류', '게시글 정보를 불러오지 못했습니다.', () => {
                window.location.replace('/posts.html');
            });
            return;
        }
        renderPost(post);
    } catch (error) {
        handleApiError(error);
    }
}

// 댓글 목록 로드
async function loadComments(postId) {
    try {
        const response = await get(`/v1/posts/${postId}/comments`);
        const comments = response?.data || [];
        renderComments(comments);
    } catch (error) {
        handleApiError(error);
    }
}

// 좋아요 토글
async function toggleLike(postId) {
    const likeBtn = document.getElementById('btn-like');
    const likeCount = document.querySelector('.stat-box#btn-like .stat-count');

    try {
        const response = await post(`/v1/posts/${postId}/likes`);
        const data = response?.data || {};

        if (likeBtn) {
            likeBtn.classList.toggle('active');
        }

        if (likeCount) {
            if (typeof data.likeCount === 'number') {
                likeCount.textContent = formatCount(data.likeCount);
            } else {
                const current = parseInt(likeCount.textContent.replace('k', '000'), 10) || 0;
                const isActive = likeBtn?.classList.contains('active');
                likeCount.textContent = formatCount(isActive ? current + 1 : Math.max(current - 1, 0));
            }
        }
    } catch (error) {
        handleApiError(error);
    }
}

// 게시글 삭제 모달 열기
function deletePost(postId) {
    const modal = document.getElementById('delete-post-modal');
    if (modal) modal.classList.add('show');
}

// 게시글 삭제 실행
async function confirmDeletePost() {
    const postId = getPostIdFromUrl();
    if (!postId) return;

    try {
        const response = await del(`/v1/posts/${postId}`);
        handleApiSuccess(response, {
            modal: true,
            title: '삭제 완료',
            code: 'POST_DELETED',
            onConfirm: () => {
                window.location.replace('/posts.html');
            }
        });
    } catch (error) {
        handleApiError(error);
    }
}

function closeDeletePostModal() {
    const modal = document.getElementById('delete-post-modal');
    if (modal) modal.classList.remove('show');
}

// 댓글 작성/수정
async function submitComment(postId) {
    const commentTextarea = document.getElementById('comment-textarea');
    const commentSubmitBtn = document.querySelector('.btn-comment-submit');
    const commentText = commentTextarea.value.trim();

    if (!commentText) {
        showAlert('알림', '댓글 내용을 입력해주세요.');
        return;
    }

    try {
        if (editingCommentId) {
            const response = await patch(`/v1/posts/${postId}/comments/${editingCommentId}`, {
                content: commentText
            });
            handleApiSuccess(response);
            editingCommentId = null;
            commentSubmitBtn.textContent = '댓글 등록';
        } else {
            const response = await post(`/v1/posts/${postId}/comments`, {
                content: commentText
            });
            handleApiSuccess(response);
        }

        commentTextarea.value = '';
        commentSubmitBtn.disabled = true;
        commentSubmitBtn.classList.remove('active');
        await loadComments(postId);
        await loadPost(postId, false); // 댓글 작성 후에는 조회수 증가 안함
    } catch (error) {
        handleApiError(error);
    }
}

// 댓글 삭제 모달 열기
window.deleteComment = function(commentId) {
    deletingCommentId = commentId;
    const modal = document.getElementById('delete-comment-modal');
    if (modal) modal.classList.add('show');
};

// 댓글 삭제 실행
async function confirmDeleteComment() {
    if (!deletingCommentId) return;
    const postId = getPostIdFromUrl();
    if (!postId) return;

    try {
        const response = await del(`/v1/posts/${postId}/comments/${deletingCommentId}`);
        handleApiSuccess(response);

        if (editingCommentId === deletingCommentId) {
            const commentTextarea = document.getElementById('comment-textarea');
            const commentSubmitBtn = document.querySelector('.btn-comment-submit');
            editingCommentId = null;
            commentTextarea.value = '';
            commentSubmitBtn.textContent = '댓글 등록';
        }

        closeDeleteModal();
        await loadComments(postId);
        await loadPost(postId, false); // 댓글 삭제 후에는 조회수 증가 안함
    } catch (error) {
        handleApiError(error);
    }
}

function closeDeleteModal() {
    deletingCommentId = null;
    const modal = document.getElementById('delete-comment-modal');
    if (modal) modal.classList.remove('show');
}

// 댓글 수정 모드로 전환
window.editComment = function(commentId) {
    const commentItem = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
    if (!commentItem) return;

    const commentContent = commentItem.querySelector('.comment-content').textContent;
    const commentTextarea = document.getElementById('comment-textarea');
    const commentSubmitBtn = document.querySelector('.btn-comment-submit');

    // 입력창에 기존 내용 세팅
    commentTextarea.value = commentContent;
    commentTextarea.focus();
    
    // 버튼 텍스트 변경 및 활성화
    editingCommentId = commentId;
    commentSubmitBtn.textContent = '댓글 수정';
    commentSubmitBtn.disabled = false;
    commentSubmitBtn.classList.add('active');
};

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    const postId = getPostIdFromUrl();
    if (!postId) {
        showAlert('오류', '게시글 ID를 찾을 수 없습니다.', () => {
            window.location.replace('/posts.html');
        });
        return;
    }

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

    // 이벤트 리스너 등록
    const likeBtn = document.getElementById('btn-like');
    const deleteBtn = document.getElementById('btn-delete-post');
    const commentSubmitBtn = document.querySelector('.btn-comment-submit');
    const editBtn = document.querySelector('.post-actions .btn-action:first-child');

    if (likeBtn) {
        likeBtn.addEventListener('click', () => toggleLike(postId));
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deletePost(postId));
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            window.location.href = `/edit-post.html?id=${postId}`;
        });
    }

    if (commentSubmitBtn) {
        commentSubmitBtn.addEventListener('click', () => submitComment(postId));
    }

    // 댓글 입력 필드 유효성 검사 (버튼 활성화)
    const commentTextarea = document.getElementById('comment-textarea');
    if (commentTextarea && commentSubmitBtn) {
        commentTextarea.addEventListener('input', () => {
            const hasText = commentTextarea.value.trim().length > 0;
            commentSubmitBtn.disabled = !hasText;
            commentSubmitBtn.classList.toggle('active', hasText);
        });
    }

    // 댓글 삭제 모달 이벤트
    const deleteModal = document.getElementById('delete-comment-modal');
    if (deleteModal) {
        const confirmBtn = deleteModal.querySelector('.btn-confirm');
        const cancelBtn = deleteModal.querySelector('.btn-cancel');
        
        if (confirmBtn) confirmBtn.addEventListener('click', confirmDeleteComment);
        if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);
    }

    // 게시글 삭제 모달 이벤트
    const deletePostModal = document.getElementById('delete-post-modal');
    if (deletePostModal) {
        const confirmBtn = deletePostModal.querySelector('.btn-confirm');
        const cancelBtn = deletePostModal.querySelector('.btn-cancel');
        
        if (confirmBtn) confirmBtn.addEventListener('click', confirmDeletePost);
        if (cancelBtn) cancelBtn.addEventListener('click', closeDeletePostModal);
    }
});
