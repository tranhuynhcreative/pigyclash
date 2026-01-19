document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_LANG = 'en';
    const DEFAULT_PAGE = 'home';
    const contentDiv = document.getElementById('content');
    const langBtn = document.getElementById('lang-btn');
    const langValueSpan = langBtn ? langBtn.querySelector('.lang-value') : null;

    // --- State Management ---
    let state = {
        lang: getQueryParam('lang') || localStorage.getItem('pref-lang') || DEFAULT_LANG,
        page: getQueryParam('page') || DEFAULT_PAGE
    };

    // --- Utility Functions ---
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    function updateUrl() {
        const newUrl = `${window.location.pathname}?page=${state.page}&lang=${state.lang}`;
        window.history.pushState(state, '', newUrl);
    }

    // --- Core Logic ---
    async function loadContent() {
        updateUrl();
        updateActiveLinks();
        updateLangButton();
        localStorage.setItem('pref-lang', state.lang);

        let filePath = '';
        if (state.page === 'home') {
            filePath = 'README.md';
        } else if (state.page === 'privacy') {
            filePath = `${state.lang}/privacy.md`;
        } else if (state.page === 'terms') {
            filePath = `${state.lang}/term_of_services.md`;
        }

        try {
            contentDiv.innerHTML = '<p>Loading...</p>';
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to load ${filePath}`);
            const markdown = await response.text();
            contentDiv.innerHTML = marked.parse(markdown);
        } catch (error) {
            console.error(error);
            contentDiv.innerHTML = `<p style="color: red;">Error: Could not load content for "${state.page}" in ${state.lang}.</p>`;
        }
    }

    function updateActiveLinks() {
        document.querySelectorAll('.site-nav .page-link').forEach(link => {
            if (link.dataset.page === state.page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function updateLangButton() {
        if (langValueSpan) {
            const label = state.lang === 'vi' ? 'Tiếng Việt' : 'English';
            langValueSpan.textContent = label;
        }

        // Highlight active lang in dropdown
        document.querySelectorAll('.language-dropdown-content a').forEach(link => {
            if (link.dataset.lang === state.lang) {
                link.classList.add('active-lang');
            } else {
                link.classList.remove('active-lang');
            }
        });
    }

    // --- Event Listeners ---

    // Page Links
    document.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.page = link.dataset.page;
            loadContent();
        });
    });

    // Logo (Home link)
    const homeLink = document.getElementById('home-link');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            state.page = 'home';
            loadContent();
        });
    }

    // Language Switching
    document.querySelectorAll('.language-dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = link.dataset.lang;
            if (newLang !== state.lang) {
                state.lang = newLang;
                loadContent();
            }
        });
    });

    // Browser Back/Forward
    window.addEventListener('popstate', (e) => {
        if (e.state) {
            state = e.state;
        } else {
            state.lang = getQueryParam('lang') || DEFAULT_LANG;
            state.page = getQueryParam('page') || DEFAULT_PAGE;
        }
        loadContent();
    });

    // --- Initial Load ---
    loadContent();
});
