import { validateNickname } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
    // 헤더 프로필 드롭다운
    const headerProfileBtn = document.getElementById('header-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    headerProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
    });

    // 프로필 이미지 미리보기
    const profileInput = document.getElementById('profile-input');
    const profilePreview = document.getElementById('profile-img-preview');

    profileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePreview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 닉네임 유효성 검사 및 수정 버튼
    const nicknameInput = document.getElementById('nickname');
    const nicknameHelper = document.getElementById('nickname-helper');
    const modifyBtn = document.getElementById('modify-btn');
    const successToast = document.getElementById('success-toast');

    function validateNicknameInput() {
        const nickname = nicknameInput.value;
        
        if (!nickname) {
            nicknameHelper.textContent = '*닉네임을 입력해주세요.';
            return false;
        }

        const result = validateNickname(nickname);
        if (!result.valid) {
            nicknameHelper.textContent = result.message;
            return false;
        }

        // 중복 닉네임 시뮬레이션 (예: '중복' 입력 시)
        if (nickname === '중복') {
            nicknameHelper.textContent = '*중복된 닉네임 입니다.';
            return false;
        }

        nicknameHelper.textContent = '';
        return true;
    }

    nicknameInput.addEventListener('input', validateNicknameInput);

    modifyBtn.addEventListener('click', () => {
        if (validateNicknameInput()) {
            successToast.classList.add('show');
            setTimeout(() => {
                successToast.classList.remove('show');
            }, 2000);
        }
    });

    // 회원 탈퇴 모달
    const withdrawLink = document.getElementById('withdraw-link');
    const withdrawModal = document.getElementById('withdraw-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');

    withdrawLink.addEventListener('click', () => {
        withdrawModal.classList.add('show');
    });

    modalCancel.addEventListener('click', () => {
        withdrawModal.classList.remove('show');
    });

    modalConfirm.addEventListener('click', () => {
        // 탈퇴 처리 후 로그인 페이지로 이동
        window.location.href = 'login.html';
    });
});
