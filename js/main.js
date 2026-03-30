document.addEventListener('DOMContentLoaded', () => {

    /* --- Theme Toggle Logic --- */
    const themeToggle = document.getElementById('theme-toggle');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    window.showToast = function(message) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    };
    const htmlElement = document.documentElement;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    // Check for saved theme
    const savedTheme = localStorage.getItem('aura-theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) updateThemeIcon(savedTheme);

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'light') {
            themeIcon.className = 'ri-sun-line';
        } else {
            themeIcon.className = 'ri-moon-line';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('aura-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    /* --- Mobile Menu Toggle --- */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'ri-close-line';
            } else {
                icon.className = 'ri-menu-4-line';
            }
        });
    }

    /* --- Navbar Scroll Effect --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- Fade Up Animations --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    /* --- Property Display Logic (Voir plus / Voir moins) --- */
    const loadMoreBtn = document.getElementById('load-more');
    const showLessBtn = document.getElementById('show-less');
    const propertiesGrid = document.getElementById('properties-grid');

    function toggleProperties(showAll) {
        const hiddenProps = document.querySelectorAll('.property-card');
        hiddenProps.forEach((prop, index) => {
            if (index >= 6) {
                if (showAll) {
                    prop.classList.remove('hidden-prop');
                    prop.style.display = 'block';
                } else {
                    prop.classList.add('hidden-prop');
                    prop.style.display = 'none';
                }
            }
        });

        if (showAll) {
            loadMoreBtn.style.display = 'none';
            showLessBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'inline-block';
            showLessBtn.style.display = 'none';
            // Scroll back to properties section when hiding
            document.getElementById('proprietes').scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => toggleProperties(true));
    if (showLessBtn) showLessBtn.addEventListener('click', () => toggleProperties(false));

    /* --- Favorites Logic --- */
    let favorites = JSON.parse(localStorage.getItem('aura-favorites')) || [];

    const favoritesTab = document.getElementById('favorites-tab');
    function updateFavoritesTabVisibility() {
        if (favoritesTab) {
            favoritesTab.style.display = favorites.length > 0 ? 'inline-block' : 'none';
            // If the tab is active but now hidden, switch to 'all'
            if (favorites.length === 0 && favoritesTab.classList.contains('active')) {
                const allTab = document.querySelector('.filter-btn[data-filter="all"]');
                if (allTab) allTab.click();
            }
        }
    }

    window.toggleFavorite = function(event, id) {
        if (event) event.stopPropagation(); // Prevent opening modal
        const index = favorites.indexOf(id);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(id);
        }
        localStorage.setItem('aura-favorites', JSON.stringify(favorites));
        updateFavoriteButtons();
        updateFavoritesTabVisibility();
        
        // Force refresh if we are on the favorites filter
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        if (activeFilterBtn && activeFilterBtn.getAttribute('data-filter') === 'favorites') {
            filterProperties();
        }
    };

    function updateFavoriteButtons() {
        document.querySelectorAll('.property-card').forEach(card => {
            const id = parseInt(card.getAttribute('data-id'));
            if (!id) return;
            const btn = card.querySelector('.wishlist-btn');
            if (btn) {
                if (favorites.includes(id)) {
                    btn.classList.add('active');
                    btn.querySelector('i').className = 'ri-heart-fill';
                } else {
                    btn.classList.remove('active');
                    btn.querySelector('i').className = 'ri-heart-line';
                }
            }
        });
    }

    updateFavoriteButtons();
    updateFavoritesTabVisibility();

    /* --- Universal Filtering Function --- */
    function filterProperties() {
        // Read current values
        const location = document.getElementById('search-location').value.toLowerCase();
        const typeValue = document.getElementById('search-type').value;
        const maxPrice = document.getElementById('search-price-max').value;
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        
        const cards = document.querySelectorAll('.property-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const id = parseInt(card.getAttribute('data-id'));
            const cardLocation = card.getAttribute('data-location') ? card.getAttribute('data-location').toLowerCase() : '';
            const cardType = card.getAttribute('data-type') ? card.getAttribute('data-type').toLowerCase() : '';
            const cardPrice = parseInt(card.getAttribute('data-price'));

            const matchesLocation = location === '' || cardLocation.includes(location);
            const matchesPrice = maxPrice === 'any' || cardPrice <= parseInt(maxPrice);
            const matchesFavorites = activeFilter === 'favorites' ? favorites.includes(id) : true;
            
            let matchesType = true;
            if (activeFilter !== 'all' && activeFilter !== 'favorites') {
                matchesType = cardType === activeFilter || (activeFilter === 'apartment' && cardType === 'penthouse');
            } else if (typeValue !== 'all') {
                matchesType = cardType === typeValue || (typeValue === 'apartment' && cardType === 'penthouse');
            }

            if (matchesLocation && matchesType && matchesPrice && matchesFavorites) {
                card.style.display = 'block';
                card.classList.remove('hidden-prop');
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Manage "Voir plus/moins" buttons during filtering
        const isFiltering = location !== '' || typeValue !== 'all' || maxPrice !== 'any' || activeFilter === 'favorites';
        if (isFiltering) {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            if (showLessBtn) showLessBtn.style.display = 'none';
        } else {
            // Reset to initial state (6 visible)
            toggleProperties(false);
        }
    }

    /* --- Live Search Listeners --- */
    const searchInputs = ['search-location', 'search-type', 'search-price-max'];
    searchInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', filterProperties);
        }
    });

    // Handle "Explorer" button (just ensures smooth scroll)
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filterProperties();
            document.getElementById('proprietes').scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* --- Category Filter Tabs (Sync with Search) --- */
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-filter');
            const typeSelect = document.getElementById('search-type');
            if (typeSelect && category !== 'favorites' && category !== 'all') {
                typeSelect.value = category;
            } else if (typeSelect && category === 'all') {
                typeSelect.value = 'all';
            }
            filterProperties();
        });
    });




    function formatPrice(price) {
        return price.toLocaleString('fr-FR') + " FCFA";
    }

    /* --- Modal Logic --- */
    const modal = document.getElementById('property-modal');
    const modalClose = document.getElementById('modal-close');
    const modalContent = document.getElementById('modal-content');

    window.openModal = function(id) {
        const prop = propertiesData.find(p => p.id === id);
        if (!prop) return;

        const html = `
            <div class="modal-content-inner">
                <div class="modal-img-container">
                    <img src="${prop.image}" alt="${prop.title}" class="modal-img">
                </div>
                <div class="modal-details">
                    <div class="modal-price">${formatPrice(prop.price)}</div>
                    <h2 class="modal-title">${prop.title}</h2>
                    <p class="modal-location"><i class="ri-map-pin-line"></i> ${prop.location}</p>
                    
                    <div class="modal-features-grid">
                        <div class="feature">
                            <i class="ri-hotel-bed-line"></i>
                            <div>
                                <strong>Chambres</strong>
                                <p>${prop.beds}</p>
                            </div>
                        </div>
                        <div class="feature">
                            <i class="ri-showers-line"></i>
                            <div>
                                <strong>Salles de bain</strong>
                                <p>${prop.baths}</p>
                            </div>
                        </div>
                        <div class="feature">
                            <i class="ri-layout-masonry-line"></i>
                            <div>
                                <strong>Surface</strong>
                                <p>${prop.sqft} m²</p>
                            </div>
                        </div>
                        <div class="feature">
                            <i class="ri-home-gear-line"></i>
                            <div>
                                <strong>Type</strong>
                                <p style="text-transform: capitalize;">${prop.type}</p>
                            </div>
                        </div>
                    </div>

                    <p class="modal-desc">${prop.description}</p>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="contactAgent(${prop.id}, this)" style="flex: 1;">
                            <i class="ri-mail-send-line"></i> Contacter l'Agent
                        </button>
                        <button class="wishlist-btn-large ${favorites.includes(prop.id) ? 'active' : ''}" onclick="toggleFavorite(null, ${prop.id}); this.classList.toggle('active');" title="Ajouter aux favoris">
                            <i class="${favorites.includes(prop.id) ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        modalContent.innerHTML = html;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    window.contactAgent = function(id, btn) {
        const prop = propertiesData.find(p => p.id === id);
        if (!prop) return;
        
        showToast(`Demande envoyée : ${prop.title}`);
        
        if (btn) {
            btn.innerHTML = '<i class="ri-check-line"></i> Envoyé';
            btn.classList.add('sent');
            btn.onclick = null;
        }

        // Redirect to chat after a short delay
        setTimeout(() => {
            window.location.href = `chat.html?prop=${encodeURIComponent(prop.title)}`;
        }, 3000);
    };

    window.contactAgentOnCard = function(event, id, btn) {
        if (event) event.stopPropagation();
        const prop = propertiesData.find(p => p.id === id);
        if (!prop) return;

        showToast(`Demande envoyée : ${prop.title}`);
        
        if (btn) {
            btn.innerHTML = '<i class="ri-check-line"></i> Envoyé';
            btn.classList.add('sent');
            btn.onclick = null;
        }

        // Redirect to chat after a short delay
        setTimeout(() => {
            window.location.href = `chat.html?prop=${encodeURIComponent(prop.title)}`;
        }, 3000);
    };

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            modalContent.innerHTML = ''; // Clean up
        }, 300);
    }

    modalClose.addEventListener('click', closeModal);
    
    // Close on clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    /* --- Authentification State Management --- */
    const loginTrigger = document.getElementById('login-trigger-link');
    const userProfileNav = document.getElementById('user-profile-nav');
    const userNameNav = document.getElementById('user-name-nav');
    const logoutBtn = document.getElementById('logout-btn');

    function checkAuthState() {
        const user = JSON.parse(localStorage.getItem('aura_user'));
        if (user) {
            if (loginTrigger) loginTrigger.style.display = 'none';
            if (userProfileNav) userProfileNav.style.display = 'flex';
            if (userNameNav) userNameNav.textContent = (user.name || user.username).split(' ')[0];
        } else {
            if (loginTrigger) loginTrigger.style.display = 'inline-block';
            if (userProfileNav) userProfileNav.style.display = 'none';
        }
    }

    checkAuthState();

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('aura_user');
            checkAuthState();
            alert('Vous êtes déconnecté.');
            window.location.reload();
        });
    }

    // Close property modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Close property modal on clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
