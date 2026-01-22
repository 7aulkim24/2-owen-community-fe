document.addEventListener('DOMContentLoaded', function() {
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

    const btnSubmit = document.getElementById('btn-submit');
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const imageInput = document.getElementById('post-image');
    const fileNameDisplay = document.getElementById('file-name-display');
    const toast = document.getElementById('toast');

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

    // [더미 기능] 완료 버튼 클릭 이벤트 (백엔드 연결 시 API 호출 필요)
    btnSubmit.addEventListener('click', function() {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            toast.textContent = '*제목, 내용을 모두 작성해주세요';
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        } else {
            // 시뮬레이션: 성공 모달 표시
            const successModal = document.getElementById('success-modal');
            if (successModal) {
                successModal.classList.add('show');
                const confirmBtn = successModal.querySelector('.btn-confirm');
                confirmBtn.onclick = () => {
                    window.location.href = 'posts.html';
                };
            }
        }
    });

    // 파일 선택 시 파일명 표시
    imageInput.addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : '파일을 선택해주세요.';
        fileNameDisplay.textContent = fileName;
    });
});
