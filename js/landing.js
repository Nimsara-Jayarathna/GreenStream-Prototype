document.addEventListener('DOMContentLoaded', () => {
    // --- Sample News for Preview ---
    const previewArticles = [
        { source: 'Reuters', title: 'Global Investment in Solar Power Hits Record High' },
        { source: 'The Guardian', title: 'UN Climate Summit: Nations Urged to Finalize Pledges' },
        { source: 'CleanTechnica', title: 'Breakthrough in Battery Tech Could Double EV Range' },
    ];
    const articleGrid = document.getElementById('preview-article-grid');
    if (articleGrid) {
        articleGrid.innerHTML = previewArticles.map(article => `
            <div class="card">
                <div class="card__content">
                    <span class="card__source">${article.source}</span>
                    <h3 class="card__title">${article.title}</h3>
                </div>
            </div>
        `).join('');
    }

    // --- Modal Handling ---
    const authModal = document.getElementById('auth-modal');
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const openModal = (view) => {
        authModal.classList.remove('hidden');
        if (view === 'signup') {
            loginView.classList.add('hidden');
            signupView.classList.remove('hidden');
        } else {
            signupView.classList.add('hidden');
            loginView.classList.remove('hidden');
        }
    };
    const closeModal = () => { authModal.classList.add('hidden'); };

    document.getElementById('login-btn').addEventListener('click', () => openModal('login'));
    document.getElementById('signup-btn').addEventListener('click', () => openModal('signup'));
    document.getElementById('cta-signup-btn').addEventListener('click', () => openModal('signup'));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });
    document.getElementById('show-signup').addEventListener('click', (e) => { e.preventDefault(); openModal('signup'); });
    document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });

    // --- Registration Logic ---
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = {
            name: document.getElementById('signup-name').value,
            title: document.getElementById('signup-title').value,
            email: document.getElementById('signup-email').value,
            password: document.getElementById('signup-password').value,
        };
        // Simulate saving user to a database
        localStorage.setItem('registeredUser', JSON.stringify(user));
        alert('Registration successful! Please login to continue.');
        openModal('login');
    });

    // --- Login Validation Logic ---
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.textContent = ''; // Clear previous errors
        
        const registeredUserJSON = localStorage.getItem('registeredUser');
        if (!registeredUserJSON) {
            loginError.textContent = 'No user registered. Please sign up first.';
            return;
        }

        const registeredUser = JSON.parse(registeredUserJSON);
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (email === registeredUser.email && password === registeredUser.password) {
            // Store a "session" to be used by the dashboard
            localStorage.setItem('loggedInUser', JSON.stringify(registeredUser));
            window.location.href = 'dashboard.html';
        } else {
            loginError.textContent = 'Invalid email or password.';
        }
    });
});