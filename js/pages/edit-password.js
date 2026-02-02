import { post, patch, handleApiError, handleApiSuccess, showToast, getFullImageUrl } from '../api.js';
import { validatePassword } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
    // 세션 정보 확인
    let currentUser = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            currentUser = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
    }

    if (!currentUser) {
        showToast('로그인이 필요한 서비스입니다.', 'error');
        window.location.href = '/login.html';
        return;
    }

    // 헤더 프로필 드롭다운
    const headerProfileBtn = document.getElementById('header-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (headerProfileBtn && profileDropdown) {
        if (currentUser.profileImageUrl) {
            const headerProfileImg = headerProfileBtn.querySelector('img');
            if (headerProfileImg) headerProfileImg.src = getFullImageUrl(currentUser.profileImageUrl);
        }

        headerProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    const logoutBtn = document.getElementById('logout-btn') || document.getElementById('logout-link');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await post('/v1/auth/logout');
                handleApiSuccess(response, {
                    modal: true,
                    title: '로그아웃',
                    code: 'LOGOUT_SUCCESS',
                    onConfirm: () => {
                        localStorage.removeItem('user');
                        window.location.href = '/login.html';
                    }
                });
            } catch (error) {
                handleApiError(error);
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            }
        });
    }

    // 비밀번호 수정 폼 요소
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('password-confirm');
    const passwordHelper = document.getElementById('password-helper');
    const confirmHelper = document.getElementById('password-confirm-helper');
    const modifyBtn = document.getElementById('modify-btn');
    const successModal = document.getElementById('success-modal');
    const successConfirmBtn = successModal.querySelector('.btn-confirm');

    // 터치 상태 관리
    const touched = {
        password: false,
        confirm: false
    };

    // 유효성 검사 및 버튼 상태 업데이트
    function validateInputs() {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        let isValid = true;

        // 1. 비밀번호 검사
        if (!password) {
            if (touched.password) {
                passwordHelper.textContent = '*비밀번호를 입력해주세요';
            }
            isValid = false;
        } else if (!validatePassword(password)) {
            if (touched.password) {
                passwordHelper.textContent = '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            }
            isValid = false;
        } else {
            passwordHelper.textContent = '';
        }

        // 2. 비밀번호 확인 검사
        if (!confirm) {
            if (touched.confirm) {
                confirmHelper.textContent = '*비밀번호를 한번 더 입력해주세요';
            }
            isValid = false;
        } else if (password !== confirm) {
            if (touched.confirm) {
                confirmHelper.textContent = '*비밀번호와 다릅니다.';
            }
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

    // 입력 이벤트 리스너 (버튼 상태만 체크)
    [passwordInput, confirmInput].forEach(input => {
        input.addEventListener('input', () => validateInputs());
    });

    // 포커스를 잃었을 때 터치 상태 업데이트 및 에러 표시
    passwordInput.addEventListener('blur', () => {
        touched.password = true;
        validateInputs();
    });
    confirmInput.addEventListener('blur', () => {
        touched.confirm = true;
        validateInputs();
    });

    // 수정하기 버튼 클릭
    modifyBtn.addEventListener('click', async () => {
        if (!validateInputs()) return;

        try {
            const response = await patch('/v1/users/password', {
                password: passwordInput.value
            });

            handleApiSuccess(response, {
                modal: true,
                title: '비밀번호 변경 완료',
                code: 'PASSWORD_UPDATED',
                onConfirm: async () => {
                    // 보안을 위해 로그아웃 처리 후 이동
                    try {
                        await post('/v1/auth/logout');
                    } catch (e) {
                        console.error('Logout failed during password change flow', e);
                    } finally {
                        localStorage.removeItem('user');
                        window.location.href = '/login.html';
                    }
                }
            });
        } catch (error) {
            handleApiError(error, document.querySelector('.edit-password-container'));
        }
    });

    // 기존 successConfirmBtn 관련 코드는 handleApiSuccess의 modal 기능을 사용하므로 대체됨

    // 초기 상태 체크
    validateInputs();
});
