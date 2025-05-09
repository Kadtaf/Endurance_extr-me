document.addEventListener('DOMContentLoaded', function() {
    // Menu Burger
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    // Gestion du clic sur le burger
    menuToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        // Basculer l'état
        this.setAttribute('aria-expanded', !isExpanded);
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
        
        // Bloquer/débloquer le défilement
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Fermeture du menu au clic sur les liens
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Smooth scroll vers la section cible
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }

            // Fermer le menu
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Validation Formulaire
    document.getElementById('newsletterForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        // Validation ici...
        console.log('Formulaire soumis');
    });
});