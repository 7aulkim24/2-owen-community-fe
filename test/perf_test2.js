const date = new Date('2024-01-01T12:00:00Z');

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

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
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
    return dateFormatter.format(date);
}

console.log('Old:', formatDateOld(date));
console.log('New:', formatDateNew(date));
