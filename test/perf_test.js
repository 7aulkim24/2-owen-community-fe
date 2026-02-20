const dates = Array.from({ length: 10000 }, (_, i) => new Date(Date.now() - i * 10000).toISOString());

function formatDateOld(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

const formatter = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});

function formatDateNew(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatter.format(date);
}

console.time('old');
for (const d of dates) formatDateOld(d);
console.timeEnd('old');

console.time('new');
for (const d of dates) formatDateNew(d);
console.timeEnd('new');
