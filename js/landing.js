document.addEventListener('DOMContentLoaded', () => {
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

    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Registration successful! Please login to continue.');
        openModal('login');
    });
});