/* ══════════════════════════════════════════════════
   MediCare Clinic — script.js
   Animations, interactions, 3D canvas, slider, forms
══════════════════════════════════════════════════ */

'use strict';

/* ── 1. LOADER ─────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hidden'), 800);
  }
  // Set min date for appointment form
  const dateInput = document.getElementById('form-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});

/* ── 2. NAVBAR ─────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  toggleBackToTop();
}, { passive: true });

hamburger?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile menu on nav link click
document.querySelectorAll('.nav-link, .btn-book.nav-btn').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── 3. SCROLL REVEAL ──────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* ── 4. COUNTER ANIMATION ──────────────────────── */
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const isFloat = target !== Math.floor(target);
  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ── 5. HERO CANVAS – 3D FLOATING PARTICLES ─────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.vx   = (Math.random() - 0.5) * 0.5;
      this.vy   = (Math.random() - 0.5) * 0.5;
      this.r    = Math.random() * 120 + 40;
      this.alpha= Math.random() * 0.12 + 0.03;
      this.hue  = Math.random() > 0.5 ? 174 : 217; // teal or blue
    }
    draw() {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      grad.addColorStop(0, `hsla(${this.hue},70%,55%,${this.alpha})`);
      grad.addColorStop(1, `hsla(${this.hue},70%,55%,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -this.r || this.x > W + this.r ||
          this.y < -this.r || this.y > H + this.r) this.reset();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 28000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  resize();
  initParticles();
  loop();

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  }, { passive: true });
})();

/* ── 6. STATS PARTICLES ────────────────────────── */
(function initStatsParticles() {
  const container = document.getElementById('stats-particles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 4 + 2;
    Object.assign(dot.style, {
      position: 'absolute',
      width: size + 'px',
      height: size + 'px',
      borderRadius: '50%',
      background: `rgba(20,184,166,${Math.random() * 0.4 + 0.1})`,
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      animation: `float ${Math.random() * 4 + 4}s ease-in-out ${Math.random() * 4}s infinite alternate`,
    });
    container.appendChild(dot);
  }

  // inject float keyframes once
  if (!document.getElementById('float-kf')) {
    const style = document.createElement('style');
    style.id = 'float-kf';
    style.textContent = `
      @keyframes float {
        from { transform: translateY(0) translateX(0); }
        to   { transform: translateY(-20px) translateX(10px); }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ── 7. TESTIMONIALS SLIDER ─────────────────────── */
(function initSlider() {
  const track  = document.getElementById('testimonial-track');
  const dots   = document.querySelectorAll('.dot');
  const btnPrev = document.getElementById('slider-prev');
  const btnNext = document.getElementById('slider-next');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  function getVisible() {
    return window.innerWidth > 1024 ? 3 :
           window.innerWidth > 640  ? 2 : 1;
  }

  function maxIndex() { return Math.max(0, total - getVisible()); }

  function goto(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goto(current >= maxIndex() ? 0 : current + 1); }
  function prev() { goto(current <= 0 ? maxIndex() : current - 1); }

  btnNext?.addEventListener('click', () => { next(); resetAuto(); });
  btnPrev?.addEventListener('click', () => { prev(); resetAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goto(i); resetAuto(); }));

  function startAuto() { autoTimer = setInterval(next, 4500); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  startAuto();
  window.addEventListener('resize', () => goto(current), { passive: true });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); resetAuto(); }
  });
})();

/* ── 8. APPOINTMENT FORM ────────────────────────── */
(function initForm() {
  const form    = document.getElementById('appointment-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Validate required fields
    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      }
    });

    if (!valid) {
      const firstError = form.querySelector('.error');
      firstError?.focus();
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate submission
    const btn = document.getElementById('form-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';

    setTimeout(() => {
      form.hidden  = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1400);
  });

  // Clear error on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });
})();

/* ── 9. BACK TO TOP ─────────────────────────────── */
const backToTop = document.getElementById('back-to-top');
function toggleBackToTop() {
  backToTop?.classList.toggle('visible', window.scrollY > 400);
}
backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 10. SMOOTH ANCHOR SCROLL ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── 11. ACTIVE NAV HIGHLIGHT ───────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinksAll.forEach(link => {
          link.classList.toggle('active-link',
            link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-30% 0px -60% 0px' }
);
sections.forEach(s => sectionObserver.observe(s));

// Inject active link style once
(function() {
  const style = document.createElement('style');
  style.textContent = `.active-link { color: var(--teal-light) !important; background: rgba(20,184,166,.12) !important; }`;
  document.head.appendChild(style);
})();

/* ── 12. PARALLAX HERO ──────────────────────────── */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroImg  = document.querySelector('.hero-bg-image img');
  if (heroImg && scrolled < window.innerHeight) {
    heroImg.style.transform = `scale(1.08) translateY(${scrolled * 0.25}px)`;
  }
}, { passive: true });

/* ── 13. CARD TILT EFFECT (Services) ───────────── */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-8px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

console.log('%c🏥 MediCare Clinic — Loaded Successfully', 'color:#14b8a6;font-size:1.1rem;font-weight:bold');
