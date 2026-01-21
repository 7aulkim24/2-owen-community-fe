import { request } from '../api.js';
import { validateEmail, validatePassword, validateNickname } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const signupBtn = document.getElementById('signup-btn');

    // 입력 요소들
    const profileInput = document.getElementById('profile-input');
    const profilePreview = document.getElementById('profile-img-preview');
    const plusIcon = document.querySelector('.plus-icon');
    const inputs = {
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        confirm: document.getElementById('password-confirm'),
        nickname: document.getElementById('nickname')
    };

    // 헬퍼 텍스트들
    const helpers = {
        profile: document.getElementById('profile-helper'),
        email: document.getElementById('email-helper'),
        password: document.getElementById('password-helper'),
        confirm: document.getElementById('password-confirm-helper'),
        nickname: document.getElementById('nickname-helper')
    };

    /**
     * 프로필 이미지 미리보기 처리
     */
    profileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePreview.src = event.target.result;
                profilePreview.style.display = 'block';
                plusIcon.style.display = 'none';
                helpers.profile.textContent = "";
                validateAll();
            };
            reader.readAsDataURL(file);
        }
    });

    /**
     * 전체 유효성 검사 및 버튼 활성화
     */
    function validateAll() {
        const emailVal = inputs.email.value;
        const passwordVal = inputs.password.value;
        const confirmVal = inputs.confirm.value;
        const nicknameVal = inputs.nickname.value;
        const hasProfile = profileInput.files.length > 0;

        let isValid = true;

        // 1. 프로필 이미지 검사
        if (!hasProfile) {
            isValid = false;
            helpers.profile.textContent = "*프로필 사진을 추가해주세요.";
        } else {
            helpers.profile.textContent = "";
        }

        // 2. 이메일 검사 (기획안 반영: 비어있거나 형식 틀린 경우 동일 메시지)
        if (!emailVal || !validateEmail(emailVal)) {
            helpers.email.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
            isValid = false;
        } else {
            helpers.email.textContent = "";
        }

        // 3. 비밀번호 검사
        if (!passwordVal) {
            helpers.password.textContent = "*비밀번호를 입력해주세요.";
            isValid = false;
        } else if (!validatePassword(passwordVal)) {
            helpers.password.textContent = "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
            isValid = false;
        } else {
            helpers.password.textContent = "";
        }

        // 4. 비밀번호 확인 검사 (기획안 반영)
        if (!confirmVal) {
            helpers.confirm.textContent = "*비밀번호를 한번더 입력해주세요";
            isValid = false;
        } else if (passwordVal !== confirmVal) {
            helpers.confirm.textContent = "*비밀번호가 다릅니다.";
            isValid = false;
        } else {
            helpers.confirm.textContent = "";
        }

        // 5. 닉네임 검사
        const nicknameResult = validateNickname(nicknameVal);
        if (!nicknameVal) {
            helpers.nickname.textContent = "*닉네임을 입력해주세요.";
            isValid = false;
        } else if (!nicknameResult.valid) {
            helpers.nickname.textContent = nicknameResult.message;
            isValid = false;
        } else {
            helpers.nickname.textContent = "";
        }

        // 버튼 상태 업데이트
        if (isValid) {
            signupBtn.disabled = false;
            signupBtn.classList.add('active');
        } else {
            signupBtn.disabled = true;
            signupBtn.classList.remove('active');
        }
    }

    // 모든 입력 필드에 이벤트 리스너 등록
    [...Object.values(inputs)].forEach(input => {
        input.addEventListener('input', validateAll);
        input.addEventListener('blur', validateAll);
    });
    
    // 초기 로드 시 실행
    validateAll();

    /**
     * 회원가입 제출 처리
     */
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert("회원가입이 완료되었습니다!");
        window.location.href = 'login.html';
    });
});
