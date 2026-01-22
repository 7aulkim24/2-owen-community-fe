// import { request } from '../api.js';
import { validateNickname } from '../utils/validation.js';

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

    // 터치 상태 관리
    let isNicknameTouched = false;

    function validateNicknameInput(showHelper = false) {
        const nickname = nicknameInput.value;
        
        if (!nickname) {
            if (showHelper || isNicknameTouched) {
                nicknameHelper.textContent = '*닉네임을 입력해주세요.';
            }
            return false;
        }

        const result = validateNickname(nickname);
        if (!result.valid) {
            if (showHelper || isNicknameTouched) {
                nicknameHelper.textContent = result.message;
            }
            return false;
        }

        nicknameHelper.textContent = '';
        return true;
    }

    nicknameInput.addEventListener('input', () => validateNicknameInput(false));
    nicknameInput.addEventListener('blur', () => {
        isNicknameTouched = true;
        validateNicknameInput(true);
    });

    /**
     * 닉네임 수정 (시뮬레이션)
     */
    modifyBtn.addEventListener('click', () => {
        if (validateNicknameInput()) {
            // 시뮬레이션: 성공 토스트 표시
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

    if (withdrawLink) {
        withdrawLink.addEventListener('click', () => {
            withdrawModal.classList.add('show');
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            withdrawModal.classList.remove('show');
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', () => {
            // 시뮬레이션: 탈퇴 처리
            alert("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }
});
