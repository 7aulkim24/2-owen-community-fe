import { request } from '../api.js';
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
     */
    function validateInputs() {
        const emailValue = emailInput.value;
        const passwordValue = passwordInput.value;

        let isEmailValid = false;
        let isPasswordValid = false;

        // 이메일 검사 (비어있거나 형식이 틀린 경우 모두 동일한 메시지 - 기획안 반영)
        if (!emailValue || !validateEmail(emailValue)) {
            emailHelper.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
        } else {
            emailHelper.textContent = "";
            isEmailValid = true;
        }

        // 비밀번호 검사
        if (!passwordValue) {
            passwordHelper.textContent = "*비밀번호를 입력해주세요.";
        } else if (!validatePassword(passwordValue)) {
            passwordHelper.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
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

    // 입력 시마다 검사 실행
    emailInput.addEventListener('input', validateInputs);
    passwordInput.addEventListener('input', validateInputs);
    
    // 초기 로드 시 실행
    validateInputs();

    /**
     * 로그인 제출 처리
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const data = await request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (data && data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
                window.location.href = 'posts.html';
            }

        } catch (error) {
            console.error("로그인 에러:", error);
            passwordHelper.textContent = "* 아이디 또는 비밀번호를 확인해주세요.";
        }
    });
});
