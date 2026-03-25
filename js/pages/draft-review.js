/**
 * 초안 검토 & 승인 — GET/PATCH/POST /v1/activities/summaries/...
 */
import {
  get,
  post,
  handleApiError,
  handleApiSuccess,
  showConfirmModal,
  showModal,
  getFullImageUrl,
} from '../api.js';

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = String(s);
  return div.innerHTML;
}

function safeHttpUrl(u) {
  if (!u) return null;
  const t = String(u).trim();
  if (/^https?:\/\//i.test(t)) return t;
  return null;
}

function getSummaryIdFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const id = p.get('id');
  return id && id.trim() ? id.trim() : null;
}

function formatHeaderDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return String(isoDate);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

function formatEventTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return escapeHtml(String(iso));
  return escapeHtml(
    d.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

function renderEvidenceList(events) {
  const evidence = document.getElementById('draft-evidence-list');
  if (!evidence) return;

  if (!events || !events.length) {
    evidence.innerHTML =
      '<p class="text-xs text-[#8b919d]">해당 일자에 수집된 이벤트가 없습니다.</p>';
    evidence.dataset.hydrated = '1';
    return;
  }

  evidence.innerHTML = events
    .map((ev) => {
      const url = safeHttpUrl(ev.eventUrl);
      const link = url
        ? `<a href="${escapeHtml(url)}" class="text-xs text-[#57a5ff] break-all mt-1 inline-block" target="_blank" rel="noopener noreferrer">GitHub에서 보기</a>`
        : '';
      const repo = ev.repoName
        ? `<p class="text-xs text-[#8b919d] mt-0.5">${escapeHtml(ev.repoName)}</p>`
        : '';
      const titlePart = ev.title ? ` · ${escapeHtml(ev.title)}` : '';
      return `
      <div class="flex gap-3 md:gap-4 draft-evidence-row border-b border-[#414752]/30 pb-3 last:border-0 last:pb-0">
        <span class="text-[#8b919d] select-none font-mono text-xs shrink-0 w-[4.5rem] md:w-[5.5rem]">${formatEventTime(ev.eventOccurredAt)}</span>
        <div class="flex-1 min-w-0">
          <p class="text-[#dfe2eb] text-sm"><span class="text-[#7bdb80] font-semibold">${escapeHtml(ev.eventType || 'event')}</span>${titlePart}</p>
          ${ev.description ? `<p class="text-xs text-[#c0c7d4] mt-1 line-clamp-2">${escapeHtml(ev.description)}</p>` : ''}
          ${repo}
          ${link}
        </div>
      </div>
    `;
    })
    .join('');
  evidence.dataset.hydrated = '1';
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

  const userRaw = localStorage.getItem('user');
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      const img = document.getElementById('header-profile-img');
      if (img && u.profileImageUrl) {
        img.src = getFullImageUrl(u.profileImageUrl) || img.src;
      }
    } catch {
      /* ignore */
    }
  }
}

function setUiFromDetail(detail, summaryId) {
  const metaDate = document.getElementById('draft-meta-date');
  const metaTitle = document.getElementById('draft-meta-title');
  const summaryText = document.getElementById('draft-ai-summary');

  if (metaDate) {
    metaDate.textContent = formatHeaderDate(detail.summaryDate);
  }
  if (metaTitle) {
    metaTitle.textContent = detail.generatedTitle || '일일 활동 초안';
  }
  if (summaryText) {
    summaryText.textContent = detail.generatedContent || '';
    summaryText.dataset.hydrated = '1';
  }

  renderEvidenceList(detail.events);

  const st = detail.status || 'generated';
  const btnApprove = document.getElementById('btn-draft-approve');
  const btnDismiss = document.getElementById('btn-draft-dismiss');
  const manual = document.getElementById('draft-manual-context');

  if (st !== 'generated') {
    if (btnApprove) btnApprove.disabled = true;
    if (btnDismiss) btnDismiss.disabled = true;
    if (manual) manual.disabled = true;
    const app = document.getElementById('app');
    if (app && !document.getElementById('draft-status-note')) {
      const note = document.createElement('p');
      note.id = 'draft-status-note';
      note.className = 'text-sm text-amber-200/90 mt-4';
      note.textContent =
        st === 'approved'
          ? '이 초안은 이미 승인되어 피드에 반영되었습니다.'
          : '이 초안은 무시 처리되었습니다.';
      app.appendChild(note);
    }
  }

  if (btnApprove && st === 'generated') {
    btnApprove.addEventListener('click', async () => {
      const manualVal = document.getElementById('draft-manual-context')?.value?.trim() || '';
      try {
        const body = manualVal ? { manualContext: manualVal } : {};
        await post(`/v1/activities/summaries/${summaryId}/approve`, body);
        showModal({
          title: '게시 완료',
          message: '피드에 반영되었습니다.',
          onConfirm: () => {
            window.location.assign('/posts.html');
          },
        });
      } catch (e) {
        handleApiError(e);
      }
    });
  }

  if (btnDismiss && st === 'generated') {
    btnDismiss.addEventListener('click', () => {
      showConfirmModal({
        title: '초안 무시',
        message: '이 초안을 무시할까요?',
        confirmText: '무시',
        cancelText: '취소',
        onConfirm: async () => {
          try {
            await post(`/v1/activities/summaries/${summaryId}/dismiss`, {});
            window.location.assign('/drafts.html');
          } catch (e) {
            handleApiError(e);
          }
        },
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  wireHeader();

  if (!localStorage.getItem('user')) {
    window.location.replace('/login.html');
    return;
  }

  const summaryId = getSummaryIdFromUrl();
  if (!summaryId) {
    window.location.replace('/drafts.html');
    return;
  }

  try {
    const { data } = await get(`/v1/activities/summaries/${summaryId}`);
    if (!data) {
      showModal({
        title: '오류',
        message: '초안을 불러올 수 없습니다.',
        onConfirm: () => window.location.assign('/drafts.html'),
      });
      return;
    }
    setUiFromDetail(data, summaryId);
  } catch (e) {
    handleApiError(e);
    showModal({
      title: '오류',
      message: e.message || '초안을 불러오지 못했습니다.',
      onConfirm: () => window.location.assign('/drafts.html'),
    });
  }
});
