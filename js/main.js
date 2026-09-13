(() => {
  'use strict';
  const body = document.body;
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const scene = document.querySelector('.journey-scene');
  const stage = document.querySelector('.journey-stage');
  const hero = document.querySelector('.hero');
  const svg = document.querySelector('.journey-svg');
  const motion = svg?.querySelector('animateMotion');
  const motionButton = document.querySelector('.motion-toggle');
  const progress = document.querySelector('.scroll-progress span');
  const header = document.querySelector('.site-header');
  let userPaused = false;
  let sequenceStarted = false;
  let frame = 0;
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  root.dataset.ready = 'true';

  function closeMenu() {
    nav?.classList.remove('open');
    body.classList.remove('menu-open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
  }
  menu?.addEventListener('click', () => {
    const opened = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(opened));
    menu.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('open', opened);
    body.classList.toggle('menu-open', opened);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  function syncMotion() {
    const paused = userPaused || document.hidden || media.matches;
    body.classList.toggle('motion-paused', paused);
    motionButton.textContent = media.matches ? 'Reduced motion' : userPaused ? 'Resume motion' : 'Pause motion';
    motionButton.setAttribute('aria-pressed', String(userPaused || media.matches));
    motionButton.disabled = media.matches;
    if (paused) svg?.pauseAnimations?.();
    else svg?.unpauseAnimations?.();
  }
  motionButton?.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);

  function startSequence() {
    if (sequenceStarted || media.matches) return;
    sequenceStarted = true;
    root.classList.add('motion-enabled');
    requestAnimationFrame(() => {
      body.classList.add('scene-started');
      syncMotion();
    });
  }
  document.querySelector('.route')?.addEventListener('animationend', (event) => {
    if (event.animationName !== 'route-draw' || media.matches) return;
    if (motion && typeof motion.beginElement === 'function') {
      motion.beginElement();
      body.classList.add('scene-connected');
      syncMotion();
    }
  });
  const art = document.querySelector('.landscape');
  if (art?.complete) startSequence();
  else {
    art?.addEventListener('load', startSequence, { once: true });
    art?.addEventListener('error', startSequence, { once: true });
    window.setTimeout(startSequence, 1800);
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    reveals.forEach((item) => revealObserver.observe(item));
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = nav?.querySelector('a[href="#' + entry.target.id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          nav.querySelectorAll('[aria-current]').forEach((item) => item.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'location');
        } else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('#story, #capabilities, #approach').forEach((item) => navObserver.observe(item));
  } else reveals.forEach((item) => item.classList.add('visible'));

  function renderScroll() {
    frame = 0;
    const y = Math.max(0, window.scrollY);
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(y / distance, 1) : 0) + ')';
    header?.classList.toggle('scrolled', y > 16);
    if (!media.matches && !userPaused && hero && scene && window.innerWidth > 760) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0) scene.style.setProperty('--hero-scroll', String(Math.min(1, y / rect.height)));
    }
  }
  function requestScroll() { if (!frame) frame = requestAnimationFrame(renderScroll); }
  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); requestScroll(); }, { passive: true });
  renderScroll();
  if (window.matchMedia('(pointer: fine)').matches && scene && stage) {
    scene.addEventListener('pointermove', (event) => {
      if (media.matches || userPaused || window.innerWidth <= 760) return;
      const rect = scene.getBoundingClientRect();
      stage.style.setProperty('--pointer-x', String((event.clientX - rect.left) / rect.width - .5));
      stage.style.setProperty('--pointer-y', String((event.clientY - rect.top) / rect.height - .5));
    }, { passive: true });
    scene.addEventListener('pointerleave', () => {
      stage.style.setProperty('--pointer-x', '0');
      stage.style.setProperty('--pointer-y', '0');
    });
  }
  media.addEventListener('change', () => {
    root.classList.toggle('motion-enabled', !media.matches);
    if (media.matches) reveals.forEach((item) => item.classList.add('visible'));
    else startSequence();
    syncMotion();
  });
  syncMotion();
})();
