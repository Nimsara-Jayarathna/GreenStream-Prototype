document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. DATA & STATE MANAGEMENT
    // ==========================================================================
    
    // Retrieve the logged-in user from localStorage, or create a default for testing
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || { name: 'Guest User', title: 'Visitor' };
    
    // User preferences are loaded from the user, with defaults for a rich initial experience
    let userPreferences = {
        name: loggedInUser.name,
        preferredCategories: ['Energy', 'Tech'],
        preferredSources: ['Reuters'],
        trackedKeywords: ['carbon capture', 'ev batteries']
    };

    // The master data source, simulating a database
    const articles = [
        { id: 1, source: 'Reuters', title: 'Global Investment in Solar Power Hits Record High', date: '2025-10-26', category: 'Energy', bookmarked: false, content: 'A new report indicates that investment in solar energy infrastructure has surpassed all previous records this quarter, driven by new policies in Europe and Asia. The trend is expected to continue as nations push for greener energy solutions.' },
        { id: 2, source: 'The Guardian', title: 'UN Climate Summit: Nations Urged to Finalize Pledges', date: '2025-10-26', category: 'Policy', bookmarked: true, content: 'As the annual UN climate summit approaches, leaders are under pressure to submit more ambitious carbon reduction targets to meet the Paris Agreement goals. Activists are demanding concrete action over promises.' },
        { id: 3, source: 'CleanTechnica', title: 'Breakthrough in Battery Tech Could Double EV Range', date: '2025-10-25', category: 'Tech', bookmarked: false, content: 'Researchers at MIT announce a new solid-state battery chemistry that promises to be safer, cheaper, and offer twice the energy density of current lithium-ion batteries, potentially revolutionizing the electric vehicle market.' },
        { id: 4, source: 'Reuters', title: 'New Regulations Target Industrial Methane Emissions', date: '2025-10-24', category: 'Policy', bookmarked: false, content: 'The Environmental Protection Agency has unveiled a new set of rules aimed at curbing methane leaks from oil and gas operations, a significant step in tackling potent greenhouse gases.' },
        { id: 5, source: 'CleanTechnica', title: 'European Union Finalizes Offshore Wind Energy Strategy', date: '2025-10-23', category: 'Energy', bookmarked: true, content: 'The EU has agreed on a comprehensive strategy to massively scale up its offshore wind capacity, aiming to become a global leader in the technology and achieve its 2050 climate neutrality goal.' },
        { id: 6, source: 'The Guardian', title: 'Report Highlights Alarming Decline in Amazon Biodiversity', date: '2025-10-22', category: 'Policy', bookmarked: false, content: 'A landmark study published in Nature reveals that deforestation and climate change are accelerating biodiversity loss in the Amazon rainforest at an unprecedented rate, calling for immediate international intervention.' },
        { id: 7, source: 'Reuters', title: 'Carbon Capture Technology Sees Major Funding Boost', date: '2025-10-21', category: 'Tech', bookmarked: false, content: 'Venture capital funding for carbon capture and sequestration (CCS) technologies has surged in the last year, signaling renewed investor confidence in its role in the energy transition.' },
        { id: 8, aource: 'The Guardian', title: 'Youth Climate Activists March in 100 Cities', date: '2025-10-20', category: 'Policy', bookmarked: false, content: 'Hundreds of thousands of young people took to the streets across the globe, demanding more decisive action on climate change from their governments ahead of the upcoming international summit.' }
    ];

    let currentPage = 1;
    const articlesPerPage = 6;

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
        <div class="card">
            <div class="card__content" data-id="${article.id}">
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
        // Render "For You" View with enhanced personalization logic
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

    // ==========================================================================
    // 4. UI HELPER FUNCTIONS
    // ==========================================================================
    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000); // Hide after 3 seconds
    };

    // ==========================================================================
    // 5. EVENT HANDLING
    // ==========================================================================
    
    // Filters
    [searchInput, ...categoryFilters, ...sourceFilters].forEach(el => {
        el.addEventListener('input', () => { currentPage = 1; renderAllViews(); });
    });

    // Clear Filters Button
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        categoryFilters.forEach(cb => cb.checked = false);
        sourceFilters.forEach(cb => cb.checked = false);
        currentPage = 1;
        renderAllViews();
    });

    // Event Delegation for dynamic content (cards, pagination)
    document.querySelector('.content-area').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('bookmark-icon')) {
            const articleId = parseInt(target.dataset.id);
            const article = articles.find(a => a.id === articleId);
            if (article) {
                article.bookmarked = !article.bookmarked;
                if (article.bookmarked) { showToast('Article bookmarked!'); }
                renderAllViews();
            }
        } else if (target.closest('.card__content')) {
            const articleId = parseInt(target.closest('.card__content').dataset.id);
            openArticleDetailModal(articleId);
        } else if (target.classList.contains('pagination__button') && target.dataset.page) {
            currentPage = parseInt(target.dataset.page);
            renderAllViews();
        } else if (target.id === 'prev-page' && !target.disabled) {
            if (currentPage > 1) { currentPage--; renderAllViews(); }
        } else if (target.id === 'next-page' && !target.disabled) {
             const totalPages = Math.ceil(articles.length / articlesPerPage); // Simplified for prototype
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

    // --- Mobile Sidebar Toggle ---
    mobileFilterToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // ==========================================================================
    // 6. MODAL & PROFILE LOGIC
    // ==========================================================================
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    
    document.getElementById('profile-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('profile-name').value = userPreferences.name;
        document.getElementById('tracked-keywords').value = userPreferences.trackedKeywords.join(', ');
        profileForm.querySelectorAll('input[name="preference"]').forEach(cb => {
            cb.checked = userPreferences.preferredCategories.includes(cb.value);
        });
        profileForm.querySelectorAll('input[name="preference-source"]').forEach(cb => {
            cb.checked = userPreferences.preferredSources.includes(cb.value);
        });
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
    
    // ==========================================================================
    // 7. INITIALIZATION
    // ==========================================================================
    profileNameDisplay.textContent = userPreferences.name;
    renderAllViews();
});