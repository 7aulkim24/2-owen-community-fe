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

    // URL에서 postId 추출 (더미용)
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id') || '1';

    // [더미 데이터] 기존 데이터 로드 (백엔드 연결 시 API 호출로 대체 필요)
    function loadExistingPost() {
        // 실제로는 API 호출이겠지만 여기선 더미 데이터를 채움
        titleInput.value = `제목 ${postId}`;
        contentInput.value = `무엇을 얘기할까요? 아무말이라면, 삶은 항상 놀라운 모험이라고 생각합니다. 우리는 매일 새로운 경험을 하고 배우며 성장합니다. 때로는 어려움과 도전이 있지만, 그것들이 우리를 더 강하고 지혜롭게 만듭니다. 또한 우리는 주변의 사람들과 연결되며 사랑과 지지를 받습니다. 그래서 우리의 삶은 소중하고 의미가 있습니다. \n\n자연도 아름다운 이야기입니다. 우리 주변의 자연은 끝없는 아름다움과 신비로움을 담고 있습니다. 산, 바다, 숲, 하늘 등 모든 것이 우리를 놀라게 만들고 감동시킵니다. 자연은 우리의 생명과 안정을 지키며 우리에게 힘을 주는 곳입니다. \n\n마지막으로, 지식을 향한 탐구는 항상 흥미로운 여정입니다. 우리는 끝없는 지식의 바다에서 배우고 발견할 수 있으며, 이것이 우리를 더 깊이 이해하고 세상을 더 넓게 보게 해줍니다. \n\n그런 의미에서, 삶은 놀라움과 경이로움으로 가득 차 있습니다. 새로운 경험을 즐기고 항상 앞으로 나아가는 것이 중요하다고 생각합니다.`;
        fileNameDisplay.textContent = 'dummy_image.png';
        updateButtonState();
    }

    // 입력 필드 변경 시 버튼 상태 업데이트
    function updateButtonState() {
        if (titleInput.value.trim() && contentInput.value.trim()) {
            btnSubmit.classList.add('active');
            btnSubmit.disabled = false;
        } else {
            btnSubmit.classList.remove('active');
            btnSubmit.disabled = true;
        }
    }

    titleInput.addEventListener('input', updateButtonState);
    contentInput.addEventListener('input', updateButtonState);

    // [더미 기능] 수정하기 버튼 클릭 이벤트 (백엔드 연결 시 API 호출 필요)
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
                    window.location.href = `post-detail.html?id=${postId}`;
                };
            }
        }
    });

    // 파일 선택 시 파일명 표시
    imageInput.addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : '파일을 선택해주세요.';
        fileNameDisplay.textContent = fileName;
    });

    // 초기 데이터 로드 호출
    loadExistingPost();
});
