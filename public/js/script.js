// Polyfills anciens navigateurs
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}
if (!Node.prototype.contains) {
    Node.prototype.contains = function(arg) {
        return !!(this.compareDocumentPosition(arg) & 16);
    };
}

document.addEventListener('DOMContentLoaded', function () {
    // === Menu Burger ===
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        const closeMenu = () => {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        };

        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isActive = this.classList.toggle('active');
            mainNav.classList.toggle('active', isActive);
            this.setAttribute('aria-expanded', isActive.toString());

            if (isActive) {
                document.addEventListener('click', clickOutsideHandler);
                document.addEventListener('keydown', handleEscapeKey);
            } else {
                document.removeEventListener('click', clickOutsideHandler);
                document.removeEventListener('keydown', handleEscapeKey);
            }
        });

        const clickOutsideHandler = (e) => {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                closeMenu();
                document.removeEventListener('click', clickOutsideHandler);
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };

        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') closeMenu();
        };
    }

    // === Récupération du token CSRF ===
    const csrfToken = document.getElementById('csrf_token');
    if (csrfToken) {
        fetch('/php/csrf.php', { credentials: 'include' })
            .then(res => res.text())
            .then(token => { csrfToken.value = token; })
            .catch(err => console.error("Erreur CSRF:", err));
    }

    // === Formulaire Newsletter (AJAX) ===
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const spinner = submitBtn.querySelector('.spinner');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.setAttribute('aria-busy', 'true');
                if (spinner) spinner.removeAttribute('hidden');
            }

            const formData = new FormData(this);
            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    showNotification({
                        title: "Erreur",
                        message: data.message || 'Erreur inconnue',
                        type: "error"
                    });
                } else {
                    showNotification({
                        title: "Succès",
                        message: data.message,
                        type: "success"
                    });
                    this.reset();
                    // Recharge un nouveau token CSRF
                    if (csrfToken) {
                        const tokenRes = await fetch('/php/csrf.php', { credentials: 'include' });
                        csrfToken.value = await tokenRes.text();
                    }
                }

            } catch (err) {
                console.error("Erreur réseau:", err);
                showNotification({
                    title: "Erreur réseau",
                    message: "Impossible d’envoyer le formulaire.",
                    type: "error"
                });
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.setAttribute('aria-busy', 'false');
                    if (spinner) spinner.setAttribute('hidden', '');
                }
            }
        });
    }

    // === Message Flash depuis PHP (optionnel) ===
    fetch('/php/message.php')
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                showNotification({
                    title: "Info",
                    message: data.message,
                    type: "success",
                    duration: 5000
                });
            }
        })
        .catch(console.warn);

  // === Bouton retour en haut ===
    document.addEventListener('DOMContentLoaded', function() {
        const backToTopBtn = document.querySelector('.back-to-top');
        
        if (backToTopBtn) {
            // Afficher/cacher le bouton au scroll
            window.addEventListener('scroll', () => {
                const visible = window.scrollY > 300;
                backToTopBtn.classList.toggle('visible', visible);
            });

            // Gestion du clic
            backToTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // Force l'affichage initial sur mobile si besoin
            if (window.innerWidth <= 768 && window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            }
        }
    });
});

// === Notification ===
function showNotification({ title, message, type = "success", duration = 4000 }) {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.innerHTML = `
        <div class="notification-icon">${type === 'success' ? '✓' : '⚠️'}</div>
        <div class="notification-content">
            <strong>${title}</strong><p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notif);

    notif.querySelector('.notification-close').addEventListener('click', () => {
        notif.remove();
    });

    setTimeout(() => notif.remove(), duration);

    // Style embarqué
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            z-index: 9999;
            max-width: 300px;
        }
        .notification.error { background: #F44336; }
        .notification-icon { font-size: 24px; margin-right: 10px; }
        .notification-close {
            margin-left: auto;
            background: none;
            border: none;
            color: inherit;
            font-size: 20px;
            cursor: pointer;
        }
        .notification-content p { margin: 0; }
    `;
    document.head.appendChild(style);
}
