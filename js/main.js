const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

requestAnimationFrame(() => document.body.classList.add('motion-ready'));

menuButton?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const progressBar = document.querySelector('.scroll-progress span');
let progressTicking = false;
const updateProgress = () => {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const progress = distance > 0 ? Math.min(window.scrollY / distance, 1) : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  progressTicking = false;
};
window.addEventListener('scroll', () => {
  if (!progressTicking) {
    requestAnimationFrame(updateProgress);
    progressTicking = true;
  }
}, { passive: true });
updateProgress();

const journey = document.querySelector('.journey-art');
if (journey && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  journey.addEventListener('pointermove', (event) => {
    const rect = journey.getBoundingClientRect();
    journey.style.setProperty('--mx', String((event.clientX - rect.left) / rect.width - 0.5));
    journey.style.setProperty('--my', String((event.clientY - rect.top) / rect.height - 0.5));
  }, { passive: true });
  journey.addEventListener('pointerleave', () => {
    journey.style.setProperty('--mx', '0');
    journey.style.setProperty('--my', '0');
  });
}

const glow = document.querySelector('.cursor-glow');
if (glow && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    glow.style.opacity = '1';
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}
