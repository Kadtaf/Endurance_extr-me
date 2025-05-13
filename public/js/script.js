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
        fetch('php/csrf.php')
            .then(response => response.text())
            .then(token => {
                csrfToken.value = token;
            });
    }

    // Gestion du formulaire
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            fetch(this.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Stocker le message de succès dans sessionStorage
                    sessionStorage.setItem('newsletterMessage', data.message);
                    // Rediriger vers l'accueil
                    window.location.href = 'index.html';
                } else {
                    alert('Erreur: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Une erreur est survenue');
            });
        });
    }
});

// Afficher le message de newsletter 
document.addEventListener('DOMContentLoaded', function() {
    const message = sessionStorage.getItem('newsletterMessage');
    if (message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'newsletter-alert success';
        alertDiv.textContent = message.toUpperCase(); // Pour "INSCRIPTION REUSSIE" en majuscules
        document.body.insertBefore(alertDiv, document.body.firstChild);

        sessionStorage.removeItem('newsletterMessage');
        setTimeout(() => alertDiv.remove(), 5000); // Disparaît après 5 secondes
    }
});