import { post, handleApiError, handleApiSuccess, getFullImageUrl } from '../api.js';

/**
 * 공통 헤더 초기화: 프로필 드롭다운 토글, 로그아웃, currentUser 파싱
 * 사용 예시: const { currentUser } = initHeader({ requireAuth: true });
 *
 * @param {Object} [options]
 * @param {boolean} [options.requireAuth=false] — true 이면 비로그인 시 /login.html 리다이렉트
 * @returns {{ currentUser: Object|null }}
 */
export function initHeader({ requireAuth = false } = {}) {
    let currentUser = null;
    try {
        const raw = localStorage.getItem('user');
        if (raw) currentUser = JSON.parse(raw);
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
    }

    if (requireAuth && !currentUser) {
        window.location.replace('/login.html');
        return { currentUser: null };
    }

    // 프로필 이미지 업데이트
    const headerProfileBtn = document.getElementById('header-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (headerProfileBtn && profileDropdown) {
        if (currentUser?.profileImageUrl) {
            const img = headerProfileBtn.querySelector('img');
            if (img) img.src = getFullImageUrl(currentUser.profileImageUrl);
        }

        headerProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    // 로그아웃 버튼 (#logout-btn 또는 #logout-link 지원)
    const logoutEl =
        document.getElementById('logout-btn') ||
        document.getElementById('logout-link');

    if (logoutEl) {
        logoutEl.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await post('/v1/auth/logout');
                handleApiSuccess(response, {
                    modal: true,
                    title: '로그아웃',
                    code: 'LOGOUT_SUCCESS',
                    onConfirm: () => {
                        localStorage.removeItem('user');
                        window.location.replace('/login.html');
                    },
                });
            } catch (error) {
                handleApiError(error);
                localStorage.removeItem('user');
                window.location.replace('/login.html');
            }
        });
    }

    return { currentUser };
}
