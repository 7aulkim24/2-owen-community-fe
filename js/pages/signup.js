import { get, post, uploadFile, handleApiError, handleApiSuccess, showToast } from '../api.js';
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

    // 중복 확인 상태 관리
    const availability = {
        email: false,
        nickname: false
    };

    // 프로필 이미지 미리보기 처리
    profileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            touched.profile = true; // 파일 선택 시 터치된 것으로 간주
            
            // FileReader 대신 createObjectURL 사용 (메모리 효율적)
            const objectUrl = URL.createObjectURL(file);
            profilePreview.src = objectUrl;
            profilePreview.style.display = 'block';
            plusIcon.style.display = 'none';
            helpers.profile.textContent = "";
            validateAll();

            // 이미지 로드 후 URL 해제 (메모리 누수 방지)
            profilePreview.onload = () => {
                URL.revokeObjectURL(objectUrl);
            };
        } else {
            // 파일 선택창에서 취소를 누르거나 파일이 없는 경우
            profilePreview.src = "";
            profilePreview.style.display = 'none';
            plusIcon.style.display = 'block';
            profileInput.value = ""; // input 초기화
            validateAll();
        }
    });

    // 프로필 이미지 클릭 시 (이미 이미지가 있으면 삭제)
    document.getElementById('profile-label').addEventListener('click', (e) => {
        if (profileInput.files.length > 0) {
            e.preventDefault(); // 파일 선택창 열리는 것 방지
            profilePreview.src = "";
            profilePreview.style.display = 'none';
            plusIcon.style.display = 'block';
            profileInput.value = ""; // input 초기화
            validateAll();
        }
    });

    // 각 필드의 터치 여부 기록
    const touched = {
        email: false,
        password: false,
        confirm: false,
        nickname: false,
        profile: false
    };

    // 중복 확인 결과 메시지 고정 여부
    const errorState = {
        email: "",
        nickname: ""
    };

    // 전체 유효성 검사 및 버튼 활성화
    function validateAll() {
        const emailVal = inputs.email.value;
        const passwordVal = inputs.password.value;
        const confirmVal = inputs.confirm.value;
        const nicknameVal = inputs.nickname.value;

        let isValid = true;

        // 1. 프로필 이미지 검사 (필수 아님)
        helpers.profile.textContent = "";

        // 2. 이메일 검사
        if (!emailVal || !validateEmail(emailVal)) {
            if (touched.email) {
                helpers.email.textContent = "*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
                helpers.email.style.color = '#e74c3c';
            }
            isValid = false;
        } else if (errorState.email) {
            // 중복 확인 등 에러 상태가 있으면 해당 메시지 유지
            helpers.email.textContent = errorState.email;
            helpers.email.style.color = '#e74c3c';
            isValid = false;
        } else {
            // 기본 형식이 유효하고 별도 에러가 없으면 (성공 메시지 상태가 아닐 때만) 초기화
            if (helpers.email.style.color !== 'rgb(39, 174, 96)') { 
                helpers.email.textContent = "";
            }
            if (!availability.email) isValid = false;
        }

        // 3. 비밀번호 검사
        if (!passwordVal) {
            if (touched.password) {
                helpers.password.textContent = "*비밀번호를 입력해주세요.";
                helpers.password.style.color = '#e74c3c';
            }
            isValid = false;
        } else if (!validatePassword(passwordVal)) {
            if (touched.password) {
                helpers.password.textContent = "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
                helpers.password.style.color = '#e74c3c';
            }
            isValid = false;
        } else {
            helpers.password.textContent = "";
        }

        // 4. 비밀번호 확인 검사
        if (!confirmVal) {
            if (touched.confirm) {
                helpers.confirm.textContent = "*비밀번호를 한번더 입력해주세요";
                helpers.confirm.style.color = '#e74c3c';
            }
            isValid = false;
        } else if (passwordVal !== confirmVal) {
            if (touched.confirm) {
                helpers.confirm.textContent = "*비밀번호가 다릅니다.";
                helpers.confirm.style.color = '#e74c3c';
            }
            isValid = false;
        } else {
            helpers.confirm.textContent = "";
        }

        // 5. 닉네임 검사
        const nicknameResult = validateNickname(nicknameVal);
        if (!nicknameVal) {
            if (touched.nickname) {
                helpers.nickname.textContent = "*닉네임을 입력해주세요.";
                helpers.nickname.style.color = '#e74c3c';
            }
            isValid = false;
        } else if (!nicknameResult.valid) {
            if (touched.nickname) {
                helpers.nickname.textContent = nicknameResult.message;
                helpers.nickname.style.color = '#e74c3c';
            }
            isValid = false;
        } else if (errorState.nickname) {
            helpers.nickname.textContent = errorState.nickname;
            helpers.nickname.style.color = '#e74c3c';
            isValid = false;
        } else {
            if (helpers.nickname.style.color !== 'rgb(39, 174, 96)') { 
                helpers.nickname.textContent = "";
            }
            if (!availability.nickname) isValid = false;
        }

        // 버튼 상태 업데이트
        if (isValid && availability.email && availability.nickname) {
            signupBtn.disabled = false;
            signupBtn.classList.add('active');
        } else {
            signupBtn.disabled = true;
            signupBtn.classList.remove('active');
        }
    }

    // 입력 시마다 검사
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', () => {
            // 입력 중에는 중복 확인 에러 상태 초기화 (재검증 유도)
            if (key === 'email') errorState.email = "";
            if (key === 'nickname') errorState.nickname = "";
            
            // 입력 중에는 버튼 상태만 체크하고, 이미 터치된 필드만 에러 갱신
            validateAll();
        });
        
        inputs[key].addEventListener('blur', () => {
            // 포커스를 잃으면 터치된 것으로 간주하고 에러 메시지 표시
            touched[key] = true;
            validateAll();
        });
    });

    // 이메일 중복 확인 API 연동
    inputs.email.addEventListener('blur', async () => {
        const email = inputs.email.value;
        if (email && validateEmail(email)) {
            try {
                const response = await get(`/v1/auth/emails/availability?email=${encodeURIComponent(email)}`);
                const result = response.data;
                if (result.available) {
                    helpers.email.textContent = "사용 가능한 이메일입니다.";
                    helpers.email.style.color = '#27ae60';
                    availability.email = true;
                    errorState.email = "";
                } else {
                    errorState.email = "*이미 사용 중인 이메일입니다.";
                    availability.email = false;
                }
                validateAll();
            } catch (error) {
                console.error('이메일 중복 확인 실패:', error);
                errorState.email = "*중복 확인 중 오류가 발생했습니다.";
                availability.email = false;
                validateAll();
            }
        }
    });

    // 닉네임 중복 확인 API 연동
    inputs.nickname.addEventListener('blur', async () => {
        const nickname = inputs.nickname.value;
        const nicknameResult = validateNickname(nickname);
        if (nickname && nicknameResult.valid) {
            try {
                const response = await get(`/v1/auth/nicknames/availability?nickname=${encodeURIComponent(nickname)}`);
                const result = response.data;
                if (result.available) {
                    helpers.nickname.textContent = "사용 가능한 닉네임입니다.";
                    helpers.nickname.style.color = '#27ae60';
                    availability.nickname = true;
                    errorState.nickname = "";
                } else {
                    errorState.nickname = "*이미 사용 중인 닉네임입니다.";
                    availability.nickname = false;
                }
                validateAll();
            } catch (error) {
                console.error('닉네임 중복 확인 실패:', error);
                errorState.nickname = "*중복 확인 중 오류가 발생했습니다.";
                availability.nickname = false;
                validateAll();
            }
        }
    });

    // 초기 로드 시 실행
    validateAll();

    // 회원가입 제출 처리
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 버튼 비활성화
        signupBtn.disabled = true;
        signupBtn.textContent = '가입 중...';

        try {
            let profileImageUrl = null;

            // 1. 프로필 이미지 업로드 (선택된 경우)
            const profileFile = profileInput.files[0];
            if (profileFile) {
                try {
                    const uploadResult = await uploadFile('/v1/auth/profile-image', profileFile, 'profileImage');
                    console.log('Upload Result:', uploadResult); // 디버깅용
                    profileImageUrl = uploadResult?.data?.profileImageUrl || null;
                } catch (uploadError) {
                    console.error('프로필 이미지 업로드 실패:', uploadError);
                    throw uploadError; // 원본 에러를 그대로 던져서 handleApiError가 처리하게 함
                }
            }

            // 2. 회원가입 요청
            const signupResponse = await post('/v1/auth/signup', {
                email: inputs.email.value,
                password: inputs.password.value,
                nickname: inputs.nickname.value,
                profileImageUrl: profileImageUrl
            });

            // 성공 메시지 표준화 (모달 사용)
            handleApiSuccess(signupResponse, {
                modal: true,
                title: '회원가입 완료',
                code: 'SIGNUP_SUCCESS',
                onConfirm: () => {
                    window.location.href = '/login.html';
                }
            });
        } catch (error) {
            console.error('회원가입 처리 중 오류:', error);
            
            // 에러 메시지 표준화
            const errorMsg = handleApiError(error, signupForm);
            
            // 에러 시에도 버튼 복구
            signupBtn.disabled = false;
            signupBtn.textContent = '회원가입';
        }
    });
});
