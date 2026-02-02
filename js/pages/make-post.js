import { post, uploadFile, handleApiError, handleApiSuccess, showToast, getFullImageUrl } from '../api.js';

document.addEventListener('DOMContentLoaded', function() {
    // 세션 정보 확인
    let currentUser = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
    }

    if (!currentUser) {
        showToast('로그인이 필요한 서비스입니다.', 'error');
        window.location.replace('/login.html');
        return;
    }

    // 헤더 프로필 드롭다운
    const headerProfileBtn = document.getElementById('header-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (headerProfileBtn && profileDropdown) {
        if (currentUser.profileImageUrl) {
            const headerProfileImg = headerProfileBtn.querySelector('img');
            if (headerProfileImg) headerProfileImg.src = getFullImageUrl(currentUser.profileImageUrl);
        }

        headerProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
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

    const btnSubmit = document.getElementById('btn-submit');
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const imageInput = document.getElementById('post-image');
    const fileNameDisplay = document.getElementById('file-name-display');

    // 입력 필드 변경 시 버튼 상태 업데이트
    function updateButtonState() {
        if (titleInput.value.trim() && contentInput.value.trim()) {
            btnSubmit.classList.add('active');
        } else {
            btnSubmit.classList.remove('active');
        }
    }

    titleInput.addEventListener('input', updateButtonState);
    contentInput.addEventListener('input', updateButtonState);

    // 완료 버튼 클릭 이벤트
    btnSubmit.addEventListener('click', async function() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            showToast('*제목, 내용을 모두 작성해주세요', 'error');
            return;
        }

        try {
            let fileUrl = null;
            const imageFile = imageInput.files[0];
            if (imageFile) {
                try {
                    const uploadResult = await uploadFile('/v1/posts/image', imageFile, 'postFile');
                    console.log('Upload Result:', uploadResult); // 디버깅용
                    fileUrl = uploadResult?.data?.postFileUrl || null;
                } catch (uploadError) {
                    console.error('이미지 업로드 실패:', uploadError);
                    throw uploadError;
                }
            }

            const response = await post('/v1/posts', {
                title,
                content,
                fileUrl
            });

            handleApiSuccess(response, {
                modal: true,
                title: '작성 완료',
                code: 'POST_CREATED',
                onConfirm: () => {
                    window.location.replace('/posts.html');
                }
            });
        } catch (error) {
            handleApiError(error);
        }
    });

    // 파일 선택 시 파일명 표시
    imageInput.addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : '파일을 선택해주세요.';
        fileNameDisplay.textContent = fileName;
    });
});
