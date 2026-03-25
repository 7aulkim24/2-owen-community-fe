/**
 * 초안 목록 — GET /v1/activities/summaries
 */
import {
  get,
  post,
  handleApiError,
  handleApiSuccess,
  getFullImageUrl,
} from '../api.js';

const STATUS_ORDER = ['generated', 'approved', 'dismissed'];
const STATUS_LABELS = {
  generated: '검토 대기',
  approved: '승인됨',
  dismissed: '무시됨',
};

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = String(s);
  return div.innerHTML;
}

function formatSummaryDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return escapeHtml(isoDate);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
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

function groupByStatus(items) {
  const map = { generated: [], approved: [], dismissed: [] };
  for (const it of items || []) {
    const st = it.status || 'generated';
    if (map[st]) map[st].push(it);
    else map.generated.push(it);
  }
  return map;
}

function renderCard(item) {
  const id = escapeHtml(item.summaryId);
  const title = escapeHtml(item.generatedTitle || '(제목 없음)');
  const preview = escapeHtml(
    (item.generatedContent || '').replace(/\s+/g, ' ').slice(0, 160)
  );
  const dateStr = formatSummaryDate(item.summaryDate);
  const count = item.eventCount ?? 0;
  const st = item.status || 'generated';
  const badgeClass = `drafts-status-badge drafts-status-badge--${st}`;
  const badge = `<span class="${badgeClass}">${escapeHtml(STATUS_LABELS[st] || st)}</span>`;

  let actions = '';
  if (st === 'generated') {
    actions = `
      <div class="drafts-card-actions">
        <a class="drafts-btn drafts-btn--primary" href="/draft-review.html?id=${id}">검토하기</a>
        <button type="button" class="drafts-btn drafts-btn--ghost" data-dismiss="${id}">무시하기</button>
      </div>
    `;
  } else if (st === 'approved' && item.postId) {
    actions = `
      <div class="drafts-card-actions">
        <a class="drafts-btn drafts-btn--ghost" href="post-detail.html?id=${escapeHtml(item.postId)}">게시글 보기</a>
      </div>
    `;
  }

  return `
    <article class="drafts-card drafts-card--${st}" data-summary-id="${id}">
      <div class="drafts-card-meta">${dateStr} · 이벤트 ${count}건 ${badge}</div>
      <h2 class="drafts-card-title">${title}</h2>
      <p class="drafts-card-preview">${preview || '내용 없음'}</p>
      ${actions}
    </article>
  `;
}

function renderList(items) {
  const container = document.getElementById('drafts-list-container');
  const emptyEl = document.getElementById('drafts-empty');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  const grouped = groupByStatus(items);
  const parts = [];

  for (const st of STATUS_ORDER) {
    const list = grouped[st];
    if (!list.length) continue;
    parts.push(`
      <section class="drafts-section" aria-labelledby="drafts-section-${st}">
        <h2 id="drafts-section-${st}" class="drafts-section-title">${escapeHtml(STATUS_LABELS[st] || st)}</h2>
        ${list.map(renderCard).join('')}
      </section>
    `);
  }

  container.innerHTML = parts.join('');

  container.querySelectorAll('[data-dismiss]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const sid = btn.getAttribute('data-dismiss');
      if (!sid) return;
      if (!window.confirm('이 초안을 무시할까요? 나중에 다시 생성되지 않을 수 있습니다.')) return;
      try {
        await post(`/v1/activities/summaries/${sid}/dismiss`, {});
        await loadDrafts();
      } catch (e) {
        handleApiError(e);
      }
    });
  });
}

async function loadDrafts() {
  const loading = document.getElementById('drafts-loading');
  const errEl = document.getElementById('drafts-error');
  if (loading) loading.hidden = false;
  if (errEl) {
    errEl.hidden = true;
    errEl.textContent = '';
  }

  try {
    const { data } = await get('/v1/activities/summaries');
    renderList(Array.isArray(data) ? data : []);
  } catch (e) {
    if (errEl) {
      errEl.textContent = e.message || '목록을 불러오지 못했습니다.';
      errEl.hidden = false;
    }
    handleApiError(e);
  } finally {
    if (loading) loading.hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('user')) {
    window.location.replace('/login.html');
    return;
  }
  wireHeader();
  loadDrafts();
});
