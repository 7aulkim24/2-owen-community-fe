import { get, post, patch, del, uploadFile, handleApiError, handleApiSuccess, showToast, getFullImageUrl } from '../api.js';
import { validateNickname } from '../utils/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
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
        window.location.href = 'login.html';
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
                        window.location.href = 'login.html';
                    }
                });
            } catch (error) {
                handleApiError(error);
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }

    // 초기 데이터 로드 (최신 정보 확인)
    async function loadUserData() {
        try {
            const response = await get('/v1/users/me');
            if (response?.data) {
                currentUser = response.data;
                localStorage.setItem('user', JSON.stringify(currentUser));
                
                // 폼 채우기
                const emailInput = document.getElementById('email');
                if (emailInput) emailInput.value = currentUser.email || '';
                
                nicknameInput.value = currentUser.nickname || '';
                if (currentUser.profileImageUrl) {
                    profilePreview.src = getFullImageUrl(currentUser.profileImageUrl);
                }
                
                // 헤더 이미지도 업데이트
                const headerProfileImg = headerProfileBtn.querySelector('img');
                if (headerProfileImg && currentUser.profileImageUrl) {
                    headerProfileImg.src = getFullImageUrl(currentUser.profileImageUrl);
                }
            }
        } catch (error) {
            handleApiError(error);
        }
    }

    // 프로필 이미지 미리보기
    const profileInput = document.getElementById('profile-input');
    const profilePreview = document.getElementById('profile-img-preview');

    profileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // FileReader 대신 createObjectURL 사용 (메모리 효율적)
            const objectUrl = URL.createObjectURL(file);
            profilePreview.src = objectUrl;
            
            // 이미지 로드 후 URL 해제
            profilePreview.onload = () => {
                URL.revokeObjectURL(objectUrl);
            };
        }
    });

    // 닉네임 유효성 검사 및 수정 버튼
    const nicknameInput = document.getElementById('nickname');
    const nicknameHelper = document.getElementById('nickname-helper');
    const modifyBtn = document.getElementById('modify-btn');
    const successModal = document.getElementById('success-modal');
    const successConfirmBtn = successModal.querySelector('.btn-confirm');

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

    // 닉네임 및 이미지 수정
    modifyBtn.addEventListener('click', async () => {
        if (!validateNicknameInput(true)) return;

        try {
            let profileImageUrl = currentUser.profileImageUrl;
            const imageFile = profileInput.files[0];
            
            // 1. 이미지가 선택된 경우 업로드
            if (imageFile) {
                try {
                    const uploadResult = await uploadFile('/v1/users/me/profile-image', imageFile, 'profileImage');
                    console.log('Upload Result:', uploadResult); // 디버깅용
                    profileImageUrl = uploadResult?.data?.profileImageUrl || profileImageUrl;
                } catch (uploadError) {
                    console.error('프로필 이미지 업로드 실패:', uploadError);
                    throw uploadError;
                }
            }

            // 2. 회원 정보 수정
            const response = await patch('/v1/users/me', {
                nickname: nicknameInput.value.trim(),
                profileImageUrl: profileImageUrl
            });

            // 로컬 스토리지 업데이트
            if (response?.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }

            handleApiSuccess(response, {
                modal: true,
                title: '수정 완료',
                code: 'PROFILE_UPDATED',
                onConfirm: () => {
                    window.location.href = 'posts.html';
                }
            });
        } catch (error) {
            handleApiError(error, document.querySelector('.edit-profile-container'));
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
        modalConfirm.addEventListener('click', async () => {
            try {
                const response = await del('/v1/users/me');
                
                withdrawModal.classList.remove('show');
                
                handleApiSuccess(response, {
                    modal: true,
                    title: '탈퇴 완료',
                    message: '회원 탈퇴가 완료되었습니다.',
                    onConfirm: () => {
                        localStorage.removeItem('user');
                        window.location.href = 'login.html';
                    }
                });
            } catch (error) {
                handleApiError(error);
            }
        });
    }

    // 실행
    loadUserData();
});
