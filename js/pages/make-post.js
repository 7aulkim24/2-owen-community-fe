import { post, uploadFile, uploadFiles, handleApiError, handleApiSuccess, showToast, getFullImageUrl, API_BASE_URL } from '../api.js';
import { initHeader } from '../utils/header-init.js';

document.addEventListener('DOMContentLoaded', function() {
    // 공통 헤더 초기화 및 인증 확인 (비로그인 시 /login.html 리다이렉트)
    const { currentUser } = initHeader({ requireAuth: true });
    if (!currentUser) return;

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

    // 이미지 미리보기 렌더링 (createObjectURL 사용 — base64보다 메모리 효율적)
    function renderImagePreviews() {
        previewContainer.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const objectUrl = URL.createObjectURL(file);
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';

            const img = document.createElement('img');
            img.alt = `Preview ${index + 1}`;
            img.onload = () => URL.revokeObjectURL(objectUrl);
            img.src = objectUrl;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn-remove-image';
            removeBtn.dataset.index = String(index);
            removeBtn.textContent = '×';

            const orderSpan = document.createElement('span');
            orderSpan.className = 'image-order';
            orderSpan.textContent = String(index + 1);

            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewItem.appendChild(orderSpan);
            previewContainer.appendChild(previewItem);
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
                    const uploadResult = await uploadFiles('/v1/posts/images', selectedFiles, 'postFiles');
                    fileUrls = uploadResult?.data?.postFileUrls || [];
                } catch (uploadError) {
                    console.error('이미지 업로드 실패:', uploadError);
                    throw uploadError; // 전역 에러 핸들러로 전달
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
