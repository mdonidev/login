// Simple dashboard script: reads user info from localStorage
(function() {
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const phone = localStorage.getItem('userPhone') || '';

    document.getElementById('display-name').textContent = name || 'User';
    document.getElementById('display-email').textContent = email || '-';
    document.getElementById('display-phone').textContent = phone || '-';

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        window.location.href = '/index.html';
    });

    // If no userId, redirect to login page
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/index.html';
    }
})();
