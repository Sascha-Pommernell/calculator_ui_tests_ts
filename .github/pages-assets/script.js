function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const button = document.querySelector('.theme-toggle');
    button.textContent = newTheme === 'light' ? '🌙' : '☀️';
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `Testlauf vom ${day}.${month}.${year}, ${hours}:${minutes}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const button = document.querySelector('.theme-toggle');
    button.textContent = savedTheme === 'light' ? '🌙' : '☀️';

    // Update timestamps to local time
    document.querySelectorAll('.test-date[data-timestamp]').forEach(element => {
        const timestamp = element.getAttribute('data-timestamp');
        if (timestamp) {
            element.textContent = formatDateTime(timestamp);
        }
    });
});
