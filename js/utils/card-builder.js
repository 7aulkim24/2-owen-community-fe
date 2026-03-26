import { formatCount, formatDate } from './formatting.js';

/** post_type 배지 라벨 매핑 */
const BADGE_LABELS = {
    auto_log: '자동 로그',
    weekly_digest: '주간 회고',
    manual: '수동'
};

/**
 * post_type에 따른 배지 HTML 생성
 * @param {string} postType - 'manual' | 'auto_log' | 'weekly_digest'
 * @returns {string} 배지 HTML (manual이면 빈 문자열)
 */
export function buildBadge(postType) {
    const type = postType || 'manual';
    if (type === 'manual') return '';
    if (!(type in BADGE_LABELS)) return '';
    const label = BADGE_LABELS[type];
    const modifier = `post-card__badge--${escapeHtml(type)}`;
    return `<span class="post-card__badge ${modifier}">${escapeHtml(label)}</span>`;
}

/**
 * source_summary에서 카운트 추출 (BE snake_case + 구형 camelCase 호환)
 */
function sourceCounts(ss) {
    let c = ss.commit_count ?? ss.commitCount ?? null;
    if (c == null && Array.isArray(ss.commits)) c = ss.commits.length;
    let pr = ss.pr_count ?? ss.prCount ?? null;
    if (pr == null && Array.isArray(ss.pull_requests)) pr = ss.pull_requests.length;
    if (pr == null && Array.isArray(ss.pullRequests)) pr = ss.pullRequests.length;
    let iss = ss.issue_count ?? ss.issueCount ?? null;
    if (iss == null && Array.isArray(ss.issues)) iss = ss.issues.length;
    return {
        commit: typeof c === 'number' ? c : c != null ? Number(c) : null,
        pr: typeof pr === 'number' ? pr : pr != null ? Number(pr) : null,
        issue: typeof iss === 'number' ? iss : iss != null ? Number(iss) : null
    };
}

/**
 * 피드 카드용 — 근거 요약 (아이콘 + 카운트 + 저장소 한 줄)
 * @param {Object} sourceSummary
 * @returns {string}
 */
export function buildSourceSummary(sourceSummary) {
    if (!sourceSummary || typeof sourceSummary !== 'object') return '';
    const { commit, pr, issue } = sourceCounts(sourceSummary);
    const chips = [];
    if (commit != null && !Number.isNaN(commit)) {
        chips.push(
            `<span class="post-card__stat-chip" title="커밋"><span class="post-card__stat-ico" aria-hidden="true">📝</span> 커밋 ${escapeHtml(String(commit))}건</span>`
        );
    }
    if (pr != null && !Number.isNaN(pr)) {
        chips.push(
            `<span class="post-card__stat-chip" title="PR"><span class="post-card__stat-ico" aria-hidden="true">💬</span> PR ${escapeHtml(String(pr))}건</span>`
        );
    }
    if (issue != null && !Number.isNaN(issue)) {
        chips.push(
            `<span class="post-card__stat-chip" title="이슈"><span class="post-card__stat-ico" aria-hidden="true">🛠️</span> 이슈 ${escapeHtml(String(issue))}건</span>`
        );
    }
    if (chips.length === 0) return '';

    const repos = sourceSummary.repos;
    let repoLine = '';
    if (Array.isArray(repos) && repos.length > 0) {
        const names = repos
            .slice(0, 2)
            .map((r) => (typeof r === 'object' && r?.name ? r.name : r))
            .filter(Boolean);
        const extra = repos.length > 2 ? ` 외 ${repos.length - 2}곳` : '';
        if (names.length) {
            repoLine = `<div class="post-card__source-repos"><span class="post-card__stat-ico" aria-hidden="true">💻</span> ${escapeHtml(names.join(', '))}${escapeHtml(extra)}</div>`;
        }
    }

    return `<div class="post-card__source-summary" role="region" aria-label="활동 근거 요약">
        <div class="post-card__stat-row">${chips.join('')}</div>
        ${repoLine}
    </div>`;
}

/**
 * 게시글 상세용 — stat-grid + 주요 커밋 + 저장소 링크
 * @param {Object} sourceSummary
 * @returns {string}
 */
export function buildDetailSourceSummary(sourceSummary) {
    if (!sourceSummary || typeof sourceSummary !== 'object') return '';
    const { commit, pr, issue } = sourceCounts(sourceSummary);
    const hasCounts =
        (commit != null && !Number.isNaN(commit)) ||
        (pr != null && !Number.isNaN(pr)) ||
        (issue != null && !Number.isNaN(issue));
    const commits = Array.isArray(sourceSummary.commits) ? sourceSummary.commits : [];
    const prs = Array.isArray(sourceSummary.pull_requests)
        ? sourceSummary.pull_requests
        : Array.isArray(sourceSummary.pullRequests)
          ? sourceSummary.pullRequests
          : [];
    const issues = Array.isArray(sourceSummary.issues) ? sourceSummary.issues : [];
    const repos = Array.isArray(sourceSummary.repos) ? sourceSummary.repos : [];

    if (!hasCounts && commits.length === 0 && repos.length === 0 && prs.length === 0 && issues.length === 0) {
        return '';
    }

    let grid = '';
    if (hasCounts) {
        const cells = [];
        if (commit != null && !Number.isNaN(commit)) {
            cells.push(
                `<div class="post-detail-source__cell"><span class="post-detail-source__cell-ico" aria-hidden="true">📝</span><span class="post-detail-source__cell-val">${escapeHtml(String(commit))}</span><span class="post-detail-source__cell-lbl">커밋</span></div>`
            );
        }
        if (pr != null && !Number.isNaN(pr)) {
            cells.push(
                `<div class="post-detail-source__cell"><span class="post-detail-source__cell-ico" aria-hidden="true">💬</span><span class="post-detail-source__cell-val">${escapeHtml(String(pr))}</span><span class="post-detail-source__cell-lbl">PR</span></div>`
            );
        }
        if (issue != null && !Number.isNaN(issue)) {
            cells.push(
                `<div class="post-detail-source__cell"><span class="post-detail-source__cell-ico" aria-hidden="true">🛠️</span><span class="post-detail-source__cell-val">${escapeHtml(String(issue))}</span><span class="post-detail-source__cell-lbl">이슈</span></div>`
            );
        }
        grid = `<div class="post-detail-source__grid">${cells.join('')}</div>`;
    }

    let commitsBlock = '';
    if (commits.length > 0) {
        const items = commits
            .slice(0, 8)
            .map((c) => {
                const repo = typeof c === 'object' && c?.repo != null ? String(c.repo) : '';
                const msg = typeof c === 'object' && c?.message != null ? String(c.message) : '';
                return `<li class="post-detail-source__commit-item"><span class="post-detail-source__commit-repo">${escapeHtml(repo)}</span><span class="post-detail-source__commit-msg">${escapeHtml(msg)}</span></li>`;
            })
            .join('');
        commitsBlock = `<div class="post-detail-source__block"><h3 class="post-detail-source__block-title">주요 커밋</h3><ul class="post-detail-source__commit-list">${items}</ul></div>`;
    }

    let reposBlock = '';
    if (repos.length > 0) {
        const items = repos
            .map((r) => {
                const name = typeof r === 'object' && r?.name ? String(r.name) : String(r);
                const url =
                    typeof r === 'object' && r?.github_url
                        ? String(r.github_url)
                        : name.includes('/')
                          ? `https://github.com/${name}`
                          : '';
                if (url) {
                    return `<li class="post-detail-source__repo-item"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="post-detail-source__repo-link">${escapeHtml(name)} <span aria-hidden="true">↗</span></a></li>`;
                }
                return `<li class="post-detail-source__repo-item"><span>${escapeHtml(name)}</span></li>`;
            })
            .join('');
        reposBlock = `<div class="post-detail-source__block"><h3 class="post-detail-source__block-title">저장소</h3><ul class="post-detail-source__repo-list">${items}</ul></div>`;
    }

    let prIssueBlock = '';
    const piParts = [];
    prs.slice(0, 6).forEach((p) => {
        const t = typeof p === 'object' && p?.title ? p.title : '';
        const repo = typeof p === 'object' && p?.repo ? p.repo : '';
        const url = typeof p === 'object' && p?.url ? p.url : '';
        if (!t) return;
        const inner = url
            ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t)}</a>`
            : escapeHtml(t);
        piParts.push(`<li class="post-detail-source__pi-item"><span class="post-detail-source__pi-kind">PR</span> (${escapeHtml(repo)}) ${inner}</li>`);
    });
    issues.slice(0, 6).forEach((p) => {
        const t = typeof p === 'object' && p?.title ? p.title : '';
        const repo = typeof p === 'object' && p?.repo ? p.repo : '';
        const url = typeof p === 'object' && p?.url ? p.url : '';
        if (!t) return;
        const inner = url
            ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t)}</a>`
            : escapeHtml(t);
        piParts.push(`<li class="post-detail-source__pi-item"><span class="post-detail-source__pi-kind">이슈</span> (${escapeHtml(repo)}) ${inner}</li>`);
    });
    if (piParts.length) {
        prIssueBlock = `<div class="post-detail-source__block"><h3 class="post-detail-source__block-title">PR / 이슈</h3><ul class="post-detail-source__pi-list">${piParts.join('')}</ul></div>`;
    }

    return `<div class="post-detail__source-summary post-detail-source">${grid}${commitsBlock}${prIssueBlock}${reposBlock}</div>`;
}

/**
 * 게시글 카드 전체 HTML 조립
 * @param {Object} post - 게시글 객체
 * @param {Function} getFullImageUrl - 이미지 URL 변환 함수
 * @returns {string} 카드 HTML
 */
export function buildPostCard(post, getFullImageUrl) {
    const postType = post.post_type ?? post.postType ?? 'manual';
    const badge = postType !== 'manual' ? buildBadge(postType) : '';
    const sourceSummary = (post.source_summary ?? post.sourceSummary)
        ? buildSourceSummary(post.source_summary ?? post.sourceSummary)
        : '';

    const rawTitle = String(post.title ?? '');
    const displayTitle = rawTitle.length > 26 ? `${rawTitle.slice(0, 26)}...` : rawTitle;
    const dateString = formatDate(post.createdAt ?? post.created_at);
    const profileImg =
        getFullImageUrl?.(post.author?.profileImageUrl ?? post.author?.profile_image_url) ||
        './assets/default-profile.png';

    const postId = escapeHtml(String(post.postId ?? post.post_id ?? ''));
    const safePostType = ['manual', 'auto_log', 'weekly_digest'].includes(postType) ? postType : 'manual';
    return `
        <article class="post-card post-card--${safePostType}" onclick="location.href='/post-detail.html?id=${postId}'">
            ${badge}
            <h3 class="post-title">${escapeHtml(displayTitle)}</h3>
            <div class="post-info">
                <div class="post-stats">
                    <span>좋아요 ${formatCount(post.likeCount ?? post.like_count ?? 0)}</span>
                    <span>댓글 ${formatCount(post.commentCount ?? post.comment_count ?? 0)}</span>
                    <span>조회수 ${formatCount(post.hits ?? 0)}</span>
                </div>
                <div class="post-date">${escapeHtml(dateString)}</div>
            </div>
            ${sourceSummary}
            <div class="post-list-divider"></div>
            <div class="post-author">
                <div class="author-img">
                    <img src="${escapeHtml(profileImg)}" alt="" loading="lazy">
                </div>
                <span class="author-name">${escapeHtml(post.author?.nickname ?? '')}</span>
            </div>
        </article>
    `;
}

export function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
