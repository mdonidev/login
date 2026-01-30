// Toggle between login and signup forms
function toggleForms(event) {
    event.preventDefault();
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // Clear any existing messages
    messageDiv.textContent = '';
    messageDiv.className = 'message';

    // Toggle active class
    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');

    // Clear form fields (reset the inner <form> elements if present)
    const loginFormEl = document.querySelector('#login-form form');
    const signupFormEl = document.querySelector('#signup-form form');
    if (loginFormEl) loginFormEl.reset();
    if (signupFormEl) signupFormEl.reset();
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('message');

    // Basic client-side validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            showMessage(data.message, 'success');
                const loginFormEl = document.querySelector('#login-form form');
                if (loginFormEl) loginFormEl.reset();

                // Store user info in localStorage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.name);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userPhone', data.phone || '');

                // Redirect to dashboard after 800ms
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 800);
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Connection error. Please try again.', 'error');
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone') ? document.getElementById('signup-phone').value : '';
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const termsAccepted = document.getElementById('terms').checked;

    // Basic client-side validation
    if (!name || !email || !password || !confirmPassword || !phone) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!termsAccepted) {
        showMessage('Please accept the Terms & Conditions', 'error');
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                confirmPassword,
                phone
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage(data.message, 'success');
            const signupFormEl = document.querySelector('#signup-form form');
            if (signupFormEl) signupFormEl.reset();

            // Store user info in localStorage
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPhone', phone);

            // Switch to login form after short delay
            setTimeout(() => {
                toggleForms(new Event('click'));
            }, 600);
        } else {
            showMessage(data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Connection error. Please try again.', 'error');
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show message helper
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;

    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.className = 'message';
            messageDiv.textContent = '';
        }, 3000);
    }
}
