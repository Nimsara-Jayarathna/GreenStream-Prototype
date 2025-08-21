document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. DATA & STATE MANAGEMENT
    // ==========================================================================
    
    // Get the logged-in user, or use a default guest.
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')) || { name: 'Guest User' };

    // Try to load user preferences from localStorage. If they don't exist, create and set defaults.
    let userPreferences = JSON.parse(localStorage.getItem('terraPulseUserPreferences'));
    if (!userPreferences) {
        userPreferences = {
            name: loggedInUser.name,
            preferredCategories: ['Energy', 'Tech'],
            preferredSources: ['Reuters'],
            trackedKeywords: ['carbon capture', 'ev batteries']
        };
        // Save the initial defaults so they persist
        localStorage.setItem('terraPulseUserPreferences', JSON.stringify(userPreferences));
    }

    const getDateDaysAgo = (days) => new Date(new Date().setDate(new Date().getDate() - days)).toISOString();

    // --- NEW & IMPROVED ARTICLE DATA WITH STABLE PICSUM IMAGES ---
    let articles = [
        // Today's Articles
        { id: 1, source: 'Reuters', title: 'Global Investment in Solar Power Hits Record High in Q3', date: getDateDaysAgo(0), category: 'Energy', bookmarked: false, bookmarkedOn: null, content: 'A new report indicates that investment in solar energy infrastructure has surpassed all previous records this quarter...', image: 'https://picsum.photos/id/1015/400/200' },
        { id: 2, source: 'The Guardian', title: 'UN Climate Summit: Nations Urged to Finalize Pledges', date: getDateDaysAgo(0), category: 'Policy', bookmarked: true, bookmarkedOn: getDateDaysAgo(1), content: 'As the annual UN climate summit approaches, leaders are under pressure...', image: 'https://picsum.photos/id/1018/400/200' },
        
        // Yesterday's Articles
        { id: 3, source: 'CleanTechnica', title: 'Breakthrough in Battery Tech Could Double EV Range', date: getDateDaysAgo(1), category: 'Tech', bookmarked: false, bookmarkedOn: null, content: 'Researchers at MIT announce a new solid-state battery chemistry...', image: 'https://picsum.photos/id/145/400/200' },
        { id: 10, source: 'Reuters', title: 'Geothermal Energy Projects Gain Momentum in Iceland', date: getDateDaysAgo(1), category: 'Energy', bookmarked: false, bookmarkedOn: null, content: 'Iceland continues to pioneer geothermal energy, with two new projects announced...', image: 'https://picsum.photos/id/160/400/200' },

        // Articles from 2 Days Ago
        { id: 4, source: 'Reuters', title: 'New Regulations Target Industrial Methane Emissions', date: getDateDaysAgo(2), category: 'Policy', bookmarked: false, bookmarkedOn: null, content: 'The Environmental Protection Agency has unveiled a new set of rules...', image: 'https://picsum.photos/id/175/400/200' },
        { id: 11, source: 'The Guardian', title: 'Corporate ESG Pledges Under Scrutiny for "Greenwashing"', date: getDateDaysAgo(2), category: 'Policy', bookmarked: false, bookmarkedOn: null, content: 'A new watchdog report claims many FTSE 100 companies are failing to meet their own ESG targets...', image: 'https://picsum.photos/id/21/400/200' },
        
        // Articles from 3 Days Ago
        { id: 5, source: 'CleanTechnica', title: 'EU Finalizes Offshore Wind Energy Strategy', date: getDateDaysAgo(3), category: 'Energy', bookmarked: true, bookmarkedOn: getDateDaysAgo(2), content: 'The EU has agreed on a comprehensive strategy to massively scale up its offshore wind capacity...', image: 'https://picsum.photos/id/201/400/200' },

        // Articles from 4 Days Ago
        { id: 6, source: 'The Guardian', title: 'Report Highlights Alarming Decline in Amazon Biodiversity', date: getDateDaysAgo(4), category: 'Policy', bookmarked: false, bookmarkedOn: null, content: 'A landmark study reveals that deforestation and climate change are accelerating biodiversity loss...', image: 'https://picsum.photos/id/219/400/200' },

        // Articles from 5 Days Ago
        { id: 7, source: 'Reuters', title: 'Carbon Capture Technology Sees Major Funding Boost', date: getDateDaysAgo(5), category: 'Tech', bookmarked: true, bookmarkedOn: getDateDaysAgo(0), content: 'Venture capital funding for carbon capture and sequestration (CCS) technologies has surged...', image: 'https://picsum.photos/id/239/400/200' },
        { id: 12, source: 'CleanTechnica', title: 'Next-Generation EVs to Feature Sodium-Ion Batteries', date: getDateDaysAgo(5), category: 'Tech', bookmarked: false, bookmarkedOn: null, content: 'Several leading automakers have announced plans to introduce sodium-ion batteries in their entry-level electric vehicles...', image: 'https://picsum.photos/id/249/400/200' },

        // Articles from 6 Days Ago
        { id: 9, source: 'The Guardian', title: 'Youth Climate Activists March in 100 Cities', date: getDateDaysAgo(6), category: 'Policy', bookmarked: false, bookmarkedOn: null, content: 'Hundreds of thousands of young people took to the streets across the globe, demanding more decisive action...', image: 'https://picsum.photos/id/257/400/200' },
        { id: 13, source: 'Reuters', title: 'Green Hydrogen Production Costs Continue to Fall', date: getDateDaysAgo(6), category: 'Energy', bookmarked: false, bookmarkedOn: null, content: 'A report from the International Energy Agency shows that the cost of producing green hydrogen has fallen by 20%...', image: 'https://picsum.photos/id/292/400/200' }
    ];

    let currentPage = 1;
    const articlesPerPage = 9;

    // ==========================================================================
    // 2. DOM ELEMENT SELECTORS
    // ==========================================================================
    const forYouGrid = document.getElementById('for-you-grid');
    const articlesGrid = document.getElementById('articles-grid');
    const bookmarksGrid = document.getElementById('bookmarks-grid');
    const paginationContainer = document.getElementById('pagination-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const dateFilter = document.getElementById('date-filter');
    const bookmarksSearchInput = document.getElementById('bookmarks-search-input');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const toast = document.getElementById('toast-notification');
    const profileNameDisplay = document.getElementById('profile-name-display');

    // ==========================================================================
    // 3. RENDER FUNCTIONS
    // ==========================================================================
    const createArticleCardHTML = (article, view) => {
        const dateToDisplay = view === 'bookmarks' && article.bookmarkedOn 
            ? `Bookmarked: ${new Date(article.bookmarkedOn).toLocaleDateString()}` 
            : `Published: ${new Date(article.date).toLocaleDateString()}`;

        return `
            <div class="card" data-id="${article.id}">
                <div class="card__image-container" data-id="${article.id}"><img src="${article.image}" alt="${article.title}" class="card__image"></div>
                <div class="card__content" data-id="${article.id}">
                    <span class="card__source">${article.source}</span>
                    <h3 class="card__title">${article.title}</h3>
                </div>
                <div class="card__footer">
                    <span class="card__date">${dateToDisplay}</span>
                    <i class="bookmark-icon ${article.bookmarked ? 'fas' : 'far'} fa-bookmark" data-id="${article.id}"></i>
                </div>
            </div>
        `;
    };

    const renderViews = () => {
        // --- "For You" View ---
        const twentyFourHoursAgo = new Date(new Date().setDate(new Date().getDate() - 1));
        const keywords = userPreferences.trackedKeywords.map(k => k.toLowerCase());
        const preferredArticles = articles.filter(a => {
            const articleDate = new Date(a.date);
            const matchesPrefs = userPreferences.preferredCategories.includes(a.category) ||
                               userPreferences.preferredSources.includes(a.source) ||
                               keywords.some(keyword => a.title.toLowerCase().includes(keyword));
            return articleDate > twentyFourHoursAgo && matchesPrefs;
        });
        forYouGrid.innerHTML = preferredArticles.length > 0 ? preferredArticles.map(a => createArticleCardHTML(a, 'for-you')).join('') : '';

        // --- "All News" View ---
        const search = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const date = dateFilter.value;
        const filteredNews = articles.filter(a =>
            (a.title.toLowerCase().includes(search)) &&
            (category === '' || a.category === category) &&
            (date === '' || a.date.startsWith(date))
        );
        const paginatedNews = filteredNews.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);
        articlesGrid.innerHTML = paginatedNews.length > 0 ? paginatedNews.map(a => createArticleCardHTML(a, 'all-news')).join('') : `<p class="empty-state">No articles match your filters.</p>`;
        renderPagination(Math.ceil(filteredNews.length / articlesPerPage));

        // --- "Bookmarks" View ---
        const bookmarkSearch = bookmarksSearchInput.value.toLowerCase();
        const bookmarkedArticles = articles.filter(a => a.bookmarked && a.title.toLowerCase().includes(bookmarkSearch));
        bookmarksGrid.innerHTML = bookmarkedArticles.length > 0 ? bookmarkedArticles.map(a => createArticleCardHTML(a, 'bookmarks')).join('') : `<p class="empty-state">Your bookmarked articles will appear here.</p>`;
    };
    
    const renderPagination = (totalPages) => {
        if (totalPages <= 1) { paginationContainer.innerHTML = ''; return; }
        let buttonsHTML = `<button class="pagination__button" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<button class="pagination__button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        buttonsHTML += `<button class="pagination__button" id="next-page" ${totalPages === 0 || currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`;
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
    const setupEventListeners = () => {
        // Tab switching
        document.querySelectorAll('.tab-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.view).classList.add('active');
            });
        });

        // Filters
        document.getElementById('all-news-filters').addEventListener('input', () => { currentPage = 1; renderViews(); });
        clearFiltersBtn.addEventListener('click', () => {
            searchInput.value = '';
            categoryFilter.value = '';
            dateFilter.value = '';
            currentPage = 1;
            renderViews();
        });
        bookmarksSearchInput.addEventListener('input', renderViews);

        // Event Delegation
        document.querySelector('.app-container').addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('bookmark-icon')) {
                const articleId = parseInt(target.dataset.id);
                const article = articles.find(a => a.id === articleId);
                if (article) {
                    article.bookmarked = !article.bookmarked;
                    if (article.bookmarked) {
                        article.bookmarkedOn = new Date().toISOString();
                        showToast('Article bookmarked!');
                    } else {
                        article.bookmarkedOn = null;
                    }
                    renderViews();
                }
            } else if (target.closest('.card__image-container') || target.closest('.card__title')) {
                const articleId = parseInt(target.closest('.card').dataset.id);
                openArticleDetailModal(articleId);
            } else if (target.classList.contains('pagination__button') && target.dataset.page) {
                currentPage = parseInt(target.dataset.page);
                renderViews();
            } else if (target.id === 'prev-page' && !target.disabled) {
                if (currentPage > 1) { currentPage--; renderViews(); }
            } else if (target.id === 'next-page' && !target.disabled) {
                const totalPages = Math.ceil(articles.length / articlesPerPage);
                if (currentPage < totalPages) { currentPage++; renderViews(); }
            }
        });

        // Profile Modal
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
            localStorage.setItem('terraPulseUserPreferences', JSON.stringify(userPreferences));
            profileNameDisplay.textContent = userPreferences.name;
            showToast('Preferences saved!');
            profileModal.classList.add('hidden');
            renderViews();
        });

        // Article Detail Modal
        const articleDetailModal = document.getElementById('article-detail-modal');
        const openArticleDetailModal = (articleId) => {
            const article = articles.find(a => a.id === articleId);
            if (!article) return;
            document.getElementById('article-detail-content').innerHTML = `
                <div class="article-detail__header"><h2 class="article-detail__title">${article.title}</h2><div class="article-detail__meta"><span>By <strong>${article.source}</strong></span> | <span>${new Date(article.date).toLocaleDateString()}</span></div></div>
                <div class="article-detail__content"><p>${article.content}</p></div>
            `;
            articleDetailModal.classList.remove('hidden');
        };
        document.getElementById('article-modal-close').addEventListener('click', () => articleDetailModal.classList.add('hidden'));

        // Logout
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });

        // Mobile Sidebar
        const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
        if(mobileFilterToggle) {
             const sidebar = document.getElementById('sidebar');
             mobileFilterToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    };
    
    // --- INITIALIZATION ---
    profileNameDisplay.textContent = userPreferences.name;
    renderViews();
    setupEventListeners();
});