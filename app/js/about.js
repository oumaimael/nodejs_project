// Initialize about page
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initPopups(); 
    
    // Highlight current page in navbar
    highlightCurrentPage();
});

// Highlight current page in navbar
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}