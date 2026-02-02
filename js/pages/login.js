import { post, handleApiError, handleApiSuccess } from '../api.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');

    const emailHelper = document.getElementById('email-helper');
    const passwordHelper = document.getElementById('password-helper');

    // 각 필드의 터치 여부 기록
    const touched = {
        email: false,
        password: false
    };

    // 실시간 유효성 검사 및 버튼 상태 업데이트
    function validateInputs() {
        const emailValue = emailInput.value;
        const passwordValue = passwordInput.value;

        let isEmailValid = false;
        let isPasswordValid = false;

        // 이메일 검사
        if (!emailValue || !validateEmail(emailValue)) {
            if (touched.email) {
                emailHelper.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
                emailHelper.style.color = '#e74c3c';
            }
        } else {
            emailHelper.textContent = "";
            isEmailValid = true;
        }

        // 비밀번호 검사
        if (!passwordValue) {
            if (touched.password) {
                passwordHelper.textContent = "*비밀번호를 입력해주세요.";
                passwordHelper.style.color = '#e74c3c';
            }
        } else if (!validatePassword(passwordValue)) {
            if (touched.password) {
                passwordHelper.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
                passwordHelper.style.color = '#e74c3c';
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
    emailInput.addEventListener('input', () => validateInputs());
    passwordInput.addEventListener('input', () => validateInputs());

    // 포커스를 잃었을 때 해당 필드를 터치된 것으로 간주하고 유효성 검사 결과 표시
    emailInput.addEventListener('blur', () => {
        touched.email = true;
        validateInputs();
    });
    passwordInput.addEventListener('blur', () => {
        touched.password = true;
        validateInputs();
    });
    
    // 초기 로드 시 실행
    validateInputs();

    // 로그인 제출 처리
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 버튼 비활성화 (중복 제출 방지)
        loginBtn.disabled = true;
        loginBtn.textContent = '로그인 중...';

        try {
            const response = await post('/v1/auth/login', {
                email: emailInput.value,
                password: passwordInput.value
            });

            // 로그인 성공 처리 (출처 기반 메시지 직접 지정)
            handleApiSuccess(response, '성공적으로 로그인되었습니다. 환영합니다!');
            
            // 사용자 정보 저장 (data 필드만 저장)
            localStorage.setItem('user', JSON.stringify(response.data));
            
            // 페이지 이동
            setTimeout(() => {
                window.location.href = '/posts.html';
            }, 1000);

        } catch (error) {
            // 에러 처리 (api.js의 handleApiError 활용)
            handleApiError(error, loginForm);
            
            // 버튼 복구
            loginBtn.disabled = false;
            loginBtn.textContent = '로그인';
        }
    });
});
