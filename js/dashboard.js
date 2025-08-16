document.addEventListener('DOMContentLoaded', () => {
    // --- MASTER DATA & USER STATE ---
    let userPreferences = {
        name: 'Dr. Anya Sharma',
        preferredCategories: ['Energy', 'Tech']
    };

    const articles = [
        { id: 1, source: 'Reuters', title: 'Global Investment in Solar Power Hits Record High', date: '2025-10-26', category: 'Energy', bookmarked: false, content: 'A new report indicates that investment in solar energy infrastructure has surpassed all previous records...' },
        { id: 2, source: 'The Guardian', title: 'UN Climate Summit: Nations Urged to Finalize Pledges', date: '2025-10-26', category: 'Policy', bookmarked: true, content: 'As the annual UN climate summit approaches, leaders are under pressure to submit more ambitious targets...' },
        { id: 3, source: 'CleanTechnica', title: 'Breakthrough in Battery Tech Could Double EV Range', date: '2025-10-25', category: 'Tech', bookmarked: false, content: 'Researchers at MIT announce a new solid-state battery chemistry that promises to revolutionize the EV market...' },
        { id: 4, source: 'Reuters', title: 'New Regulations Target Industrial Methane Emissions', date: '2025-10-24', category: 'Policy', bookmarked: false, content: 'The EPA has unveiled a new set of rules aimed at curbing methane leaks from oil and gas operations...' },
        { id: 5, source: 'CleanTechnica', title: 'European Union Finalizes Offshore Wind Energy Strategy', date: '2025-10-23', category: 'Energy', bookmarked: true, content: 'The EU has agreed on a comprehensive strategy to massively scale up its offshore wind capacity...' },
        { id: 6, source: 'The Guardian', title: 'Report Highlights Alarming Decline in Amazon Biodiversity', date: '2025-10-22', category: 'Policy', bookmarked: false, content: 'A landmark study reveals that deforestation and climate change are accelerating biodiversity loss...' },
        { id: 7, source: 'Reuters', title: 'Carbon Capture Technology Sees Major Funding Boost', date: '2025-10-21', category: 'Tech', bookmarked: false, content: 'Venture capital funding for carbon capture and sequestration (CCS) technologies has surged...' },
        { id: 8, source: 'The Guardian', title: 'Youth Climate Activists March in 100 Cities', date: '2025-10-20', category: 'Policy', bookmarked: false, content: 'Hundreds of thousands of young people took to the streets across the globe...' }
    ];

    let currentPage = 1;
    const articlesPerPage = 6;

    // --- DOM Elements ---
    const forYouGrid = document.getElementById('for-you-grid');
    const articlesGrid = document.getElementById('articles-grid');
    const bookmarksGrid = document.getElementById('bookmarks-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const sourceFilters = document.querySelectorAll('input[name="source"]');

    // --- RENDER FUNCTIONS ---
    const createArticleCard = (article) => `
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

    const render = () => {
        // "For You" feed
        const preferredArticles = articles.filter(a => userPreferences.preferredCategories.includes(a.category));
        forYouGrid.innerHTML = preferredArticles.map(createArticleCard).join('') || "<p>Update your profile to get personalized news.</p>";

        // Filtered "All News" feed
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategories = Array.from(categoryFilters).filter(cb => cb.checked).map(cb => cb.value);
        const selectedSources = Array.from(sourceFilters).filter(cb => cb.checked).map(cb => cb.value);
        const filteredArticles = articles.filter(a => 
            (a.title.toLowerCase().includes(searchTerm)) &&
            (selectedCategories.length === 0 || selectedCategories.includes(a.category)) &&
            (selectedSources.length === 0 || selectedSources.includes(a.source))
        );

        // Pagination for "All News"
        const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
        const paginatedArticles = filteredArticles.slice((currentPage - 1) * articlesPerPage, currentPage * articlesPerPage);
        articlesGrid.innerHTML = paginatedArticles.map(createArticleCard).join('') || "<p>No articles match your filters.</p>";
        renderPagination(totalPages, filteredArticles.length);
        
        // Bookmarks
        const bookmarkedArticles = articles.filter(a => a.bookmarked);
        bookmarksGrid.innerHTML = bookmarkedArticles.map(createArticleCard).join('') || "<p>You have no bookmarked articles.</p>";
    };
    
    const renderPagination = (totalPages) => {
        const container = document.getElementById('pagination-container');
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        let buttons = `<button class="pagination__button" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
        for (let i = 1; i <= totalPages; i++) {
            buttons += `<button class="pagination__button ${i === currentPage ? 'pagination__button--active' : ''}" data-page="${i}">${i}</button>`;
        }
        buttons += `<button class="pagination__button" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>&raquo;</button>`;
        container.innerHTML = buttons;
    };

    // --- EVENT HANDLING ---
    // Filtering
    [searchInput, ...categoryFilters, ...sourceFilters].forEach(el => {
        el.addEventListener('input', () => { currentPage = 1; render(); });
    });

    // Delegated events for cards, pagination, and tabs
    document.querySelector('.app-container').addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('bookmark-icon')) {
            const articleId = parseInt(target.dataset.id);
            const article = articles.find(a => a.id === articleId);
            if (article) { article.bookmarked = !article.bookmarked; render(); }
        } else if (target.closest('.card__content')) {
            const articleId = parseInt(target.closest('.card__content').dataset.id);
            openArticleDetailModal(articleId);
        } else if (target.classList.contains('pagination__button') && target.dataset.page) {
            currentPage = parseInt(target.dataset.page);
            render();
        } else if (target.id === 'prev-page') {
            if (currentPage > 1) { currentPage--; render(); }
        } else if (target.id === 'next-page') {
            const totalPages = Math.ceil(articles.length / articlesPerPage); // Simplified for prototype
            if (currentPage < totalPages) { currentPage++; render(); }
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

    // --- MODAL & PROFILE LOGIC ---
    const profileModal = document.getElementById('profile-modal');
    const profileForm = document.getElementById('profile-form');
    
    const openProfileModal = () => {
        document.getElementById('profile-name').value = userPreferences.name;
        profileForm.querySelectorAll('input[name="preference"]').forEach(cb => {
            cb.checked = userPreferences.preferredCategories.includes(cb.value);
        });
        profileModal.classList.remove('hidden');
    };
    
    document.getElementById('profile-link').addEventListener('click', (e) => { e.preventDefault(); openProfileModal(); });
    document.getElementById('profile-modal-close').addEventListener('click', () => profileModal.classList.add('hidden'));

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userPreferences.name = document.getElementById('profile-name').value;
        userPreferences.preferredCategories = Array.from(profileForm.querySelectorAll('input[name="preference"]:checked')).map(cb => cb.value);
        alert('Preferences saved!');
        profileModal.classList.add('hidden');
        render();
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
    
    // Initial Load
    render();
});