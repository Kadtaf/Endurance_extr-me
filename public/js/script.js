document.addEventListener('DOMContentLoaded', function() {
    // Menu Burger
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            this.setAttribute('aria-expanded', this.classList.contains('active'));
        });
    }

    // CSRF Token
    const csrfToken = document.getElementById('csrf_token');
    if (csrfToken) {
        fetch('./php/csrf.php')
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.text();
            })
            .then(token => {
                if (token) csrfToken.value = token;
            })
            .catch(err => console.error('CSRF Error:', err));
    }

    // Gestion formulaire
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';

            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                // Vérification contenu JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    throw new Error(`Invalid response: ${text.substring(0, 50)}`);
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP ${response.status}`);
                }

                if (data.success) {
                    sessionStorage.setItem('newsletterMessage', data.message);
                    window.location.href = 'index.html';
                } else {
                    showAlert(data.message || 'Unknown error', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert(error.message || 'Request failed', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Affichage message
    const message = sessionStorage.getItem('newsletterMessage');
    if (message) {
        showAlert(message, 'success');
        sessionStorage.removeItem('newsletterMessage');
    }
});

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.innerHTML = `
        <span>${message.toUpperCase()}</span>
        <button class="alert-close">&times;</button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Fermeture manuelle
    alertDiv.querySelector('.alert-close').addEventListener('click', () => {
        alertDiv.remove();
    });
    
    // Fermeture auto
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}