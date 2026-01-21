import { validatePassword } from '../utils/validation.js';

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

    // 비밀번호 수정 폼 요소
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('password-confirm');
    const passwordHelper = document.getElementById('password-helper');
    const confirmHelper = document.getElementById('password-confirm-helper');
    const modifyBtn = document.getElementById('modify-btn');
    const successToast = document.getElementById('success-toast');

    /**
     * 유효성 검사 및 버튼 상태 업데이트
     */
    function validateInputs() {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        let isValid = true;

        // 1. 비밀번호 검사
        if (!password) {
            passwordHelper.textContent = '*비밀번호를 입력해주세요';
            isValid = false;
        } else if (!validatePassword(password)) {
            passwordHelper.textContent = '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            isValid = false;
        } else if (confirm && password !== confirm) {
            passwordHelper.textContent = '*비밀번호 확인과 다릅니다.';
            isValid = false;
        } else {
            passwordHelper.textContent = '';
        }

        // 2. 비밀번호 확인 검사
        if (!confirm) {
            confirmHelper.textContent = '*비밀번호를 한번 더 입력해주세요';
            isValid = false;
        } else if (password !== confirm) {
            confirmHelper.textContent = '*비밀번호와 다릅니다.';
            isValid = false;
        } else {
            confirmHelper.textContent = '';
        }

        // 버튼 상태 업데이트
        if (isValid) {
            modifyBtn.disabled = false;
            modifyBtn.classList.add('active');
        } else {
            modifyBtn.disabled = true;
            modifyBtn.classList.remove('active');
        }

        return isValid;
    }

    // 입력 이벤트 리스너
    [passwordInput, confirmInput].forEach(input => {
        input.addEventListener('input', validateInputs);
    });

    // 수정하기 버튼 클릭
    modifyBtn.addEventListener('click', () => {
        if (validateInputs()) {
            successToast.classList.add('show');
            setTimeout(() => {
                successToast.classList.remove('show');
            }, 2000);
            
            // 입력창 초기화 (선택 사항)
            passwordInput.value = '';
            confirmInput.value = '';
            modifyBtn.disabled = true;
            modifyBtn.classList.remove('active');
        }
    });

    // 초기 상태 체크
    validateInputs();
});
