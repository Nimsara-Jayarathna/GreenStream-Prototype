document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. DATA & STATE MANAGEMENT
    // ==========================================================================
    let userPreferences = {
        name: 'Dr. Anya Sharma',
        preferredCategories: ['Energy', 'Tech'],
        preferredSources: ['Reuters'],
        trackedKeywords: ['carbon capture', 'ev batteries']
    };

    const articles = [
        { id: 1, source: 'Reuters', title: 'Global Investment in Solar Power Hits Record High', date: '2025-10-26', category: 'Energy', bookmarked: false, content: 'A new report indicates...', image: 'https://picsum.photos/seed/1/400/200' },
        { id: 2, source: 'The Guardian', title: 'UN Climate Summit: Nations Urged to Finalize Pledges', date: '2025-10-26', category: 'Policy', bookmarked: true, content: 'As the annual UN climate summit approaches...', image: 'https://picsum.photos/seed/2/400/200' },
        { id: 3, source: 'CleanTechnica', title: 'Breakthrough in Battery Tech Could Double EV Range', date: '2025-10-25', category: 'Tech', bookmarked: false, content: 'Researchers at MIT announce a new solid-state battery chemistry...', image: 'https://picsum.photos/seed/3/400/200' },
        { id: 4, source: 'Reuters', title: 'New Regulations Target Industrial Methane Emissions', date: '2025-10-24', category: 'Policy', bookmarked: false, content: 'The Environmental Protection Agency has unveiled new rules...', image: 'https://picsum.photos/seed/4/400/200' },
        { id: 5, source: 'CleanTechnica', title: 'European Union Finalizes Offshore Wind Energy Strategy', date: '2025-10-23', category: 'Energy', bookmarked: true, content: 'The EU has agreed on a comprehensive strategy...', image: 'https://picsum.photos/seed/5/400/200' },
        { id: 6, source: 'The Guardian', title: 'Report Highlights Alarming Decline in Amazon Biodiversity', date: '2025-10-22', category: 'Policy', bookmarked: false, content: 'A landmark study reveals that deforestation and climate change...', image: 'https://picsum.photos/seed/6/400/200' },
        { id: 7, source: 'Reuters', title: 'Carbon Capture Technology Sees Major Funding Boost', date: '2025-10-21', category: 'Tech', bookmarked: false, content: 'Venture capital funding for carbon capture has surged...', image: 'https://picsum.photos/seed/7/400/200' },
        { id: 8, source: 'The Guardian', title: 'Youth Climate Activists March in 100 Cities', date: '2025-10-20', category: 'Policy', bookmarked: false, content: 'Hundreds of thousands of young people took to the streets...', image: 'https://picsum.photos/seed/8/400/200' }
    ];

    let currentPage = 1;
    const articlesPerPage = 6;
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || { name: 'Guest User' };

    // ==========================================================================
    // 2. DOM ELEMENT SELECTORS
    // ==========================================================================
    const forYouGrid = document.getElementById('for-you-grid');
    const articlesGrid = document.getElementById('articles-grid');
    const bookmarksGrid = document.getElementById('bookmarks-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const sourceFilters = document.querySelectorAll('input[name="source"]');
    const paginationContainer = document.getElementById('pagination-container');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const toast = document.getElementById('toast-notification');
    const profileNameDisplay = document.getElementById('profile-name-display');
    const logoutLink = document.getElementById('logout-link');
    const sidebar = document.getElementById('sidebar');
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');

    // ==========================================================================
    // 3. RENDER FUNCTIONS
    // ==========================================================================
    const createArticleCardHTML = (article) => `
        <div class="card" data-id="${article.id}">
            <div class="card__image-container">
                <img src="${article.image}" alt="${article.title}" class="card__image">
            </div>
            <div class="card__content">
                <span class="card__source">${article.source}</span>
                <h3 class="card__title">${article.title}</h3>
            </div>
            <div class="card__footer">
                <span class="card__date">${new Date(article.date).toLocaleDateString()}</span>
                <i class="bookmark-icon ${article.bookmarked ? 'fas' : 'far'} fa-bookmark" data-id="${article.id}"></i>
            </div>
        </div>
    `;

    const renderAllViews = () => {
        // Render "For You" View
        const keywords = userPreferences.trackedKeywords.map(k => k.toLowerCase());
        const preferredArticles = articles.filter(a => 
            userPreferences.preferredCategories.includes(a.category) ||
            userPreferences.preferredSources.includes(a.source) ||
            keywords.some(keyword => a.title.toLowerCase().includes(keyword))
        );
        forYouGrid.innerHTML = preferredArticles.length > 0 ? preferredArticles.map(createArticleCardHTML).join('') : `<p class="empty-state">Update your profile to get personalized news.</p>`;

        // Filter for "All News" View
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategories = Array.from(categoryFilters).filter(cb => cb.checked).map(cb => cb.value);
        const selectedSources = Array.from(sourceFilters).filter(cb => cb.checked).map(cb => cb.value);
        const filteredArticles = articles.filter(a => 
            (a.title.toLowerCase().includes(searchTerm)) &&
            (selectedCategories.length === 0 || selectedCategories.includes(a.category)) &&
            (selectedSources.length === 0 || selectedSources.includes(a.source))
        );

        // Paginate and Render "All News" View
        const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
        const paginatedArticles = filteredArticles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);
        articlesGrid.innerHTML = paginatedArticles.length > 0 ? paginatedArticles.map(createArticleCardHTML).join('') : `<p class="empty-state">No articles match your filters.</p>`;
        renderPagination(totalPages);
        
        // Render "Bookmarks" View
        const bookmarkedArticles = articles.filter(a => a.bookmarked);
        bookmarksGrid.innerHTML = bookmarkedArticles.length > 0 ? bookmarkedArticles.map(createArticleCardHTML).join('') : `<p class="empty-state">Your bookmarked articles will appear here.</p>`;
    };
    
    const renderPagination = (totalPages) => {
        if (totalPages <= 1) { paginationContainer.innerHTML = ''; return; }
        let buttonsHTML = `<button class="pagination__button" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<button class="pagination__button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        buttonsHTML += `<button class="pagination__button" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`;
        paginationContainer.innerHTML = buttonsHTML;
    };

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    };

    // ==========================================================================
    // 4. EVENT HANDLING & INITIALIZATION
    // ==========================================================================
    
    // Filters & Clear Button
    [searchInput, ...categoryFilters, ...sourceFilters].forEach(el => {
        el.addEventListener('input', () => { currentPage = 1; renderAllViews(); });
    });
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilters.forEach(cb => cb.checked = false);
        sourceFilters.forEach(cb => cb.checked = false);
        currentPage = 1;
        renderAllViews();
    });

    // Event Delegation for dynamic content
    document.querySelector('.app-container').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('bookmark-icon')) {
            const articleId = parseInt(target.dataset.id);
            const article = articles.find(a => a.id === articleId);
            if (article) {
                article.bookmarked = !article.bookmarked;
                if (article.bookmarked) { showToast('Article bookmarked!'); }
                renderAllViews();
            }
        } else if (target.closest('.card__image-container') || target.closest('.card__title')) {
            const articleId = parseInt(target.closest('.card').dataset.id);
            openArticleDetailModal(articleId);
        } else if (target.classList.contains('pagination__button') && target.dataset.page) {
            currentPage = parseInt(target.dataset.page);
            renderAllViews();
        } else if (target.id === 'prev-page' && !target.disabled) {
            if (currentPage > 1) { currentPage--; renderAllViews(); }
        } else if (target.id === 'next-page' && !target.disabled) {
             const totalPages = Math.ceil(articles.length / articlesPerPage);
            if (currentPage < totalPages) { currentPage++; renderAllViews(); }
        }
    });

    // Tab switching
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.view).classList.add('active');
        });
    });

    // Mobile Sidebar Toggle
    mobileFilterToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // --- MODAL & PROFILE LOGIC ---
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    document.getElementById('profile-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('profile-name').value = userPreferences.name;
        document.getElementById('tracked-keywords').value = userPreferences.trackedKeywords.join(', ');
        profileForm.querySelectorAll('input[name="preference"]').forEach(cb => { cb.checked = userPreferences.preferredCategories.includes(cb.value); });
        profileForm.querySelectorAll('input[name="preference-source"]').forEach(cb => { cb.checked = userPreferences.preferredSources.includes(cb.value); });
        profileModal.classList.remove('hidden');
    });
    document.getElementById('profile-modal-close').addEventListener('click', () => profileModal.classList.add('hidden'));

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userPreferences.name = document.getElementById('profile-name').value;
        userPreferences.preferredCategories = Array.from(profileForm.querySelectorAll('input[name="preference"]:checked')).map(cb => cb.value);
        userPreferences.preferredSources = Array.from(profileForm.querySelectorAll('input[name="preference-source"]:checked')).map(cb => cb.value);
        userPreferences.trackedKeywords = document.getElementById('tracked-keywords').value.split(',').map(k => k.trim()).filter(Boolean);
        profileNameDisplay.textContent = userPreferences.name;
        showToast('Preferences saved!');
        profileModal.classList.add('hidden');
        renderAllViews();
    });

    const articleDetailModal = document.getElementById('article-detail-modal');
    const openArticleDetailModal = (articleId) => {
        const article = articles.find(a => a.id === articleId);
        if (!article) return;
        document.getElementById('article-detail-content').innerHTML = `
            <div class="article-detail__header">
                <h2 class="article-detail__title">${article.title}</h2>
                <div class="article-detail__meta"><span>By <strong>${article.source}</strong></span> | <span>${new Date(article.date).toLocaleDateString()}</span></div>
            </div>
            <div class="article-detail__content"><p>${article.content}</p></div>
        `;
        articleDetailModal.classList.remove('hidden');
    };
    document.getElementById('article-modal-close').addEventListener('click', () => articleDetailModal.classList.add('hidden'));

    // --- Logout ---
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    });
    
    // --- INITIALIZATION ---
    profileNameDisplay.textContent = userPreferences.name;
    renderAllViews();
});