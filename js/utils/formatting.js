/**
 * 숫자 포맷팅 (1,000 -> 1k 등)
 * @param {number} count 
 * @returns {string|number}
 */
export function formatCount(count) {
    if (count >= 1000) {
        return Math.floor(count / 1000) + 'k';
    }
    return count;
}

// Intl.DateTimeFormat 인스턴스 캐싱으로 formatting 성능 최적화
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});

/**
 * 날짜 포맷팅 (YYYY-MM-DD HH:mm:ss)
 * @param {string} dateString 
 * @returns {string}
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return dateFormatter.format(date);
}
