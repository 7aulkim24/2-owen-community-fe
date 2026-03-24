/**
 * 초안 검토 & 승인 (Phase 2 스텁)
 * 실제 API 연동 시 /v1/... draft 엔드포인트에 맞게 교체
 */
import { post, handleApiError, handleApiSuccess, showModal, showConfirmModal } from '../api.js';

const els = {
  summaryText: () => document.getElementById('draft-ai-summary'),
  evidenceList: () => document.getElementById('draft-evidence-list'),
  manualContext: () => document.getElementById('draft-manual-context'),
  btnApprove: () => document.getElementById('btn-draft-approve'),
  btnDismiss: () => document.getElementById('btn-draft-dismiss'),
  metaDate: () => document.getElementById('draft-meta-date'),
  metaTitle: () => document.getElementById('draft-meta-title'),
};

function setStubContent() {
  const summary = els.summaryText();
  const evidence = els.evidenceList();
  const metaDate = els.metaDate();
  const metaTitle = els.metaTitle();

  if (metaTitle) {
    metaTitle.textContent = '일일 활동 초안';
  }
  if (metaDate) {
    const d = new Date();
    metaDate.textContent = d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }

  if (summary && !summary.dataset.hydrated) {
    summary.textContent =
      '백엔드에서 초안 요약을 불러오면 이 영역이 채워집니다. (현재는 데모 텍스트입니다.)';
    summary.dataset.hydrated = '1';
  }

  if (evidence && !evidence.dataset.hydrated) {
    evidence.innerHTML = `
      <div class="flex gap-4 draft-evidence-row">
        <span class="text-[#8b919d] select-none font-mono text-sm shrink-0">—</span>
        <div class="flex-1">
          <p class="text-[#7bdb80] mb-1 text-sm">API 연동 후 커밋·PR 타임라인이 표시됩니다.</p>
          <p class="text-xs text-[#8b919d]">예: feat: … / Commit hash: …</p>
        </div>
      </div>
    `;
    evidence.dataset.hydrated = '1';
  }
}

async function tryLoadDraftFromApi() {
  // 예시: const res = await get('/v1/drafts/current');
  return false;
}

function wireHeader() {
  const headerProfileBtn = document.getElementById('header-profile-btn');
  const profileDropdown = document.getElementById('profile-dropdown');
  if (headerProfileBtn && profileDropdown) {
    headerProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => profileDropdown.classList.remove('show'));
  }

  const logoutBtn = document.getElementById('logout-link');
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
            window.location.replace('/login.html');
          },
        });
      } catch (err) {
        handleApiError(err);
        localStorage.removeItem('user');
        window.location.replace('/login.html');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  wireHeader();
  const loaded = await tryLoadDraftFromApi();
  if (!loaded) setStubContent();

  const btnApprove = els.btnApprove();
  const btnDismiss = els.btnDismiss();

  if (btnApprove) {
    btnApprove.addEventListener('click', async () => {
      void els.manualContext()?.value?.trim();
      try {
        // await post('/v1/drafts/approve', { manualContext: manual });
        showModal({
          title: '알림',
          message: '승인 API 연동 전입니다. (스텁)',
          onConfirm: () => window.location.assign('posts.html'),
        });
      } catch (e) {
        handleApiError(e);
      }
    });
  }

  if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
      showConfirmModal({
        title: '초안 무시',
        message: '초안을 무시하고 피드로 돌아갈까요? (스텁 · API 연동 전)',
        confirmText: '피드로',
        cancelText: '취소',
        onConfirm: () => window.location.assign('/posts.html'),
      });
    });
  }
});
