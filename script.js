// Navbar scroll effect
const navbar = document.getElementById('navbar');
let ticking = false;

window.addEventListener('scroll', function () {
  if (!ticking) {
    requestAnimationFrame(function () {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      ticking = false;
    });
    ticking = true;
  }
});

// Mobile navigation
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

function toggleNav() {
  var isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
}

function closeNav() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

// Close on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    closeNav();
    hamburger.focus();
  }
});

// Scroll animations with IntersectionObserver
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.fade-up').forEach(function (el) {
  observer.observe(el);
});
