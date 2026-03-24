import { get, post, del, handleApiError, handleApiSuccess, showToast, showConfirmModal, getFullImageUrl } from '../api.js';

const PROVIDERS = {
    github: {
        name: 'GitHub',
        icon: '🐙',
        description: '커밋, PR, 이슈 활동 자동 수집',
    },
    notion: {
        name: 'Notion',
        icon: '📝',
        description: '페이지/문서 수정 이벤트 수집',
        comingSoon: true,
    },
};

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderConnectedCard(account) {
    const meta = PROVIDERS[account.provider] || { name: account.provider, icon: '🔗', description: '' };
    const connectedAt = account.connectedAt ? new Date(account.connectedAt).toLocaleDateString('ko-KR') : '';
    return `
        <div class="integration-card integration-card--connected" data-account-id="${escapeHtml(account.accountId)}">
            <div class="integration-card__header">
                <span class="integration-card__icon">${meta.icon}</span>
                <span class="integration-card__name">${escapeHtml(meta.name)}</span>
            </div>
            <div class="integration-card__body">
                <p class="integration-card__username">${escapeHtml(account.providerUsername || '')}</p>
                <p class="integration-card__date">연동일: ${escapeHtml(connectedAt)}</p>
            </div>
            <div class="integration-card__actions">
                <button type="button" class="btn-integration btn-disconnect" data-account-id="${escapeHtml(account.accountId)}">연동 해제</button>
            </div>
        </div>
    `;
}

function renderPendingCard(providerKey) {
    const meta = PROVIDERS[providerKey];
    if (!meta) return '';
    const modifier = meta.comingSoon ? 'integration-card--coming-soon' : 'integration-card--disconnected';
    const btnHtml = meta.comingSoon
        ? '<span class="btn-integration btn-disabled">Phase 2에서 지원 예정</span>'
        : `<button type="button" class="btn-integration btn-connect" data-provider="${escapeHtml(providerKey)}">연동하기</button>`;
    return `
        <div class="integration-card ${modifier}" data-provider="${escapeHtml(providerKey)}">
            <div class="integration-card__header">
                <span class="integration-card__icon">${meta.icon}</span>
                <span class="integration-card__name">${escapeHtml(meta.name)}</span>
            </div>
            <div class="integration-card__body">
                <p class="integration-card__description">${escapeHtml(meta.description)}</p>
            </div>
            <div class="integration-card__actions">
                ${btnHtml}
            </div>
        </div>
    `;
}

async function loadIntegrations() {
    const connectedEl = document.getElementById('connected-cards');
    const pendingEl = document.getElementById('pending-cards');
    if (!connectedEl || !pendingEl) return;

    try {
        const response = await get('/v1/integrations');
        const accounts = response?.data || [];

        // 연결된 provider 집합 (O(1) 조회)
        const connectedProviders = new Set(accounts.map((a) => a.provider));

        // 연결된 카드 렌더링
        connectedEl.innerHTML = accounts.map(renderConnectedCard).join('');

        // PROVIDERS 객체를 순회: 미연동 항목만 pending 카드로 렌더링
        // → provider가 추가돼도 이 함수를 수정할 필요 없음
        const pendingCards = Object.keys(PROVIDERS)
            .filter((key) => !connectedProviders.has(key))
            .map(renderPendingCard);
        pendingEl.innerHTML = pendingCards.join('');
    } catch (error) {
        handleApiError(error);
    }
}

/** innerHTML 갱신마다 호출하면 리스너가 중복됨 → #integrations-list에 위임 한 번만 바인딩 */
function bindIntegrationsListDelegation() {
    const list = document.getElementById('integrations-list');
    if (!list || list.dataset.integrationDelegation === '1') return;
    list.dataset.integrationDelegation = '1';

    list.addEventListener('click', (e) => {
        const connectBtn = e.target.closest('.btn-connect');
        if (connectBtn && !connectBtn.classList.contains('btn-disabled')) {
            const provider = connectBtn.dataset.provider;
            if (provider !== 'github') return;
            void (async () => {
                try {
                    const response = await get('/v1/integrations/github/authorize');
                    const url = response?.data?.authorizeUrl;
                    if (url) {
                        window.location.href = url;
                    } else {
                        showToast('연동 URL을 가져올 수 없습니다.', 'error');
                    }
                } catch (error) {
                    handleApiError(error);
                }
            })();
            return;
        }

        const disconnectBtn = e.target.closest('.btn-disconnect');
        if (disconnectBtn && !disconnectBtn.classList.contains('btn-disabled')) {
            const accountId = disconnectBtn.dataset.accountId;
            if (!accountId) return;
            showConfirmModal({
                title: '연동 해제',
                message: '연동을 해제하시겠습니까? GitHub 활동 자동 수집이 중단됩니다.',
                confirmText: '해제',
                cancelText: '취소',
                dangerConfirm: true,
                onConfirm: () => {
                    void (async () => {
                        try {
                            await del(`/v1/integrations/${accountId}`);
                            showToast('연동이 해제되었습니다.', 'success');
                            loadIntegrations();
                        } catch (error) {
                            handleApiError(error);
                        }
                    })();
                },
            });
        }
    });
}

function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === '1') {
        showToast('GitHub 연동이 완료되었습니다.', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('error') === '1') {
        showToast('연동에 실패했습니다. 다시 시도해주세요.', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    checkUrlParams();

    let currentUser = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) currentUser = JSON.parse(userStr);
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
    }

    if (!currentUser) {
        showToast('로그인이 필요한 서비스입니다.', 'error');
        window.location.replace('/login.html');
        return;
    }

    // 세션 쿠키와 localStorage 불일치 방지 — 서버에서 로그인 상태 검증
    try {
        const me = await get('/v1/auth/me');
        if (me?.data) {
            localStorage.setItem('user', JSON.stringify(me.data));
            currentUser = me.data;
        }
    } catch (error) {
        localStorage.removeItem('user');
        showToast('로그인이 필요한 서비스입니다.', 'error');
        window.location.replace('/login.html');
        return;
    }

    const headerProfileBtn = document.getElementById('header-profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (headerProfileBtn && profileDropdown) {
        if (currentUser.profileImageUrl) {
            const img = headerProfileBtn.querySelector('img');
            if (img) img.src = getFullImageUrl(currentUser.profileImageUrl);
        }
        headerProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => profileDropdown.classList.remove('show'));
    }

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const response = await post('/v1/auth/logout');
                handleApiSuccess(response, {
                    modal: true,
                    title: '로그아웃',
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

    bindIntegrationsListDelegation();
    await loadIntegrations();
});
