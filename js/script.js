document.addEventListener('DOMContentLoaded', function() {
    // Menu Burger
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
        this.setAttribute('aria-expanded', this.classList.contains('active'));
    });

    // Génération du token CSRF
    const csrfToken = document.getElementById('csrf_token');
    if (csrfToken) {
        fetch('php/generate-csrf.php')
            .then(response => response.text())
            .then(token => {
                csrfToken.value = token;
            });
    }

    // Validation du formulaire côté client
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            const email = this.querySelector('input[name="email"]').value;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                e.preventDefault();
                alert('Veuillez entrer un email valide');
            }
        });
    }
});



fetch('php/csrf.php')
    .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.text();
    })
    .catch(error => console.error('CSRF fetch failed:', error));