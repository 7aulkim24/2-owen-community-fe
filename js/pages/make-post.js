import { post, uploadFile, handleApiError, handleApiSuccess, showToast, getFullImageUrl, API_BASE_URL } from '../api.js';

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
    const previewContainer = document.getElementById('image-preview-container');
    const fileCountDisplay = document.getElementById('file-count-display');

    // 선택된 파일들을 저장할 배열
    let selectedFiles = [];

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

    // 이미지 미리보기 렌더링
    function renderImagePreviews() {
        previewContainer.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="btn-remove-image" data-index="${index}">×</button>
                    <span class="image-order">${index + 1}</span>
                `;
                previewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });

        // 파일 수 표시 업데이트
        if (selectedFiles.length > 0) {
            fileCountDisplay.textContent = `${selectedFiles.length}/5 장 선택됨`;
        } else {
            fileCountDisplay.textContent = '최대 5장까지 선택 가능';
        }
    }

    // 파일 선택 이벤트
    imageInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        // 5장 초과 선택 시 제한
        if (selectedFiles.length + files.length > 5) {
            showToast('최대 5장까지만 선택할 수 있습니다.', 'error');
            const allowedCount = 5 - selectedFiles.length;
            selectedFiles = [...selectedFiles, ...files.slice(0, allowedCount)];
        } else {
            selectedFiles = [...selectedFiles, ...files];
        }
        
        renderImagePreviews();
        // input 초기화 (같은 파일 재선택 가능하게)
        e.target.value = '';
    });

    // 이미지 삭제 버튼 (이벤트 위임)
    previewContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-remove-image')) {
            const index = parseInt(e.target.dataset.index);
            selectedFiles.splice(index, 1);
            renderImagePreviews();
        }
    });

    // 완료 버튼 클릭 이벤트
    btnSubmit.addEventListener('click', async function() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            showToast('*제목, 내용을 모두 작성해주세요', 'error');
            return;
        }

        try {
            let fileUrls = [];
            
            // 다중 이미지 업로드
            if (selectedFiles.length > 0) {
                try {
                    // FormData 생성 및 파일 추가
                    const formData = new FormData();
                    selectedFiles.forEach(file => {
                        formData.append('postFiles', file);
                    });

                    // 다중 업로드 API 호출
                    const uploadResponse = await fetch(`${API_BASE_URL}/v1/posts/images`, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('이미지 업로드 실패');
                    }

                    const uploadResult = await uploadResponse.json();
                    fileUrls = uploadResult?.data?.postFileUrls || [];
                } catch (uploadError) {
                    console.error('이미지 업로드 실패:', uploadError);
                    throw uploadError;
                }
            }

            const response = await post('/v1/posts', {
                title,
                content,
                fileUrls
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
});
