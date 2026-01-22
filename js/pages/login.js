// import { request } from '../api.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');

    const emailHelper = document.getElementById('email-helper');
    const passwordHelper = document.getElementById('password-helper');

    /**
     * 실시간 유효성 검사 및 버튼 상태 업데이트
     * @param {boolean} showHelpers - 헬퍼 텍스트 표시 여부
     */
    function validateInputs(showHelpers = false) {
        const emailValue = emailInput.value;
        const passwordValue = passwordInput.value;

        let isEmailValid = false;
        let isPasswordValid = false;

        // 이메일 검사
        if (!emailValue || !validateEmail(emailValue)) {
            if (showHelpers) {
                emailHelper.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
            }
        } else {
            emailHelper.textContent = "";
            isEmailValid = true;
        }

        // 비밀번호 검사
        if (!passwordValue) {
            if (showHelpers) {
                passwordHelper.textContent = "*비밀번호를 입력해주세요.";
            }
        } else if (!validatePassword(passwordValue)) {
            if (showHelpers) {
                passwordHelper.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            }
        } else {
            passwordHelper.textContent = "";
            isPasswordValid = true;
        }

        // 버튼 상태 활성화/비활성화
        if (isEmailValid && isPasswordValid) {
            loginBtn.disabled = false;
            loginBtn.classList.add('active');
        } else {
            loginBtn.disabled = true;
            loginBtn.classList.remove('active');
        }
    }

    // 입력 시마다 검사 실행 (버튼 상태만 업데이트)
    emailInput.addEventListener('input', () => validateInputs(false));
    passwordInput.addEventListener('input', () => validateInputs(false));

    // 포커스를 잃었을 때 유효성 검사 결과 표시
    emailInput.addEventListener('blur', () => validateInputs(true));
    passwordInput.addEventListener('blur', () => validateInputs(true));
    
    // 초기 로드 시 실행 (헬퍼 숨김)
    validateInputs(false);

    /**
     * 로그인 제출 처리 (시뮬레이션)
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 시뮬레이션: 성공적인 로그인 처리
        localStorage.setItem('user', JSON.stringify({
            userId: '123',
            email: emailInput.value,
            nickname: '더미 사용자',
            profileImageUrl: './assets/default-profile.png'
        }));
        
        window.location.href = 'posts.html';
    });
});
