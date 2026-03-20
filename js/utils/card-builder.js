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
 * source_summary JSON → 근거 섹션 HTML
 * @param {Object} sourceSummary - { commits?, pullRequests?, repoName?, ... }
 * @returns {string} 근거 섹션 HTML
 */
export function buildSourceSummary(sourceSummary) {
    if (!sourceSummary || typeof sourceSummary !== 'object') return '';
    const parts = [];
    if (sourceSummary.commits != null) parts.push(`커밋 ${escapeHtml(String(sourceSummary.commits))}건`);
    if (sourceSummary.pullRequests != null) parts.push(`PR ${escapeHtml(String(sourceSummary.pullRequests))}건`);
    if (sourceSummary.issues != null) parts.push(`이슈 ${escapeHtml(String(sourceSummary.issues))}건`);
    if (sourceSummary.repoName) parts.push(escapeHtml(String(sourceSummary.repoName)));
    if (parts.length === 0) return '';
    return `<div class="post-card__source-summary">${parts.join(' · ')}</div>`;
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

    const displayTitle =
        post.title.length > 26 ? post.title.substring(0, 26) + '...' : post.title;
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

function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
