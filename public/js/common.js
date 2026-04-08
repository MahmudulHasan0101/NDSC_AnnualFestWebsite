/* =================================================================
   NDSC ANNUAL FEST 2026 — COMMON JS
   Handles:
     - Navigation active states + auth-aware CTA (Register vs Profile icon)
     - Mobile drawer
     - Scroll effects
     - Scroll-triggered reveal animations
     - Particle network background
   ================================================================= */

(function () {
  'use strict';

  /* ── Current page ──────────────────────────────────────────── */
  function getCurrentPage() {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    if (file === '' || file === 'index.html') return 'index';
    return file.replace('.html', '');
  }

  /* ── Set active nav link ────────────────────────────────────── */
  function setActiveNav() {
    const current = getCurrentPage();
    document.querySelectorAll('.nav__link[data-page]').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-page') === current);
    });
  }

  /* ── Auth-aware CTA ─────────────────────────────────────────────
     Checks /api/auth/me — if the user is logged in we swap the
     "Register" button for a profile icon with a dropdown.
  ─────────────────────────────────────────────────────────────── */
  async function initAuthCta() {
    const ctaContainers = document.querySelectorAll('.nav__cta, .nav__right a, .nav__drawer-cta');

    let user = null;
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        user = data.data?.user ?? null;
      }
      // 401 = not logged in — expected for guests, not an error
      // Note: the browser will still log a 401 network entry in DevTools;
      // that is a browser behaviour and cannot be suppressed from JS.
    } catch { /* offline or server not running — stay as guest */ }

    if (!user) return; // not logged in — leave default Register links

    // Replace every CTA anchor with a profile widget
    ctaContainers.forEach(function (el) {
      const isDrawer = el.classList.contains('nav__drawer-cta');

      if (isDrawer) {
        el.textContent = 'My Dashboard';
        el.href        = '/dashboard.html';
      } else {
        // Build profile icon pill
        const initials = user.full_name
          .split(' ')
          .map(w => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        el.outerHTML = `
          <div class="nav__profile-wrap">
            <button class="nav__profile-btn" id="profileBtn" aria-label="Account menu" aria-expanded="false">
              <span class="nav__profile-avatar">${initials}</span>
              <span class="nav__profile-name">${user.full_name.split(' ')[0]}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M2 3.5l3 3 3-3"/>
              </svg>
            </button>
            <div class="nav__profile-dropdown" id="profileDropdown">
              <a href="/dashboard.html">Dashboard</a>
              <button id="logoutBtn">Log Out</button>
            </div>
          </div>`;
      }
    });

    // Wire up dropdown toggle
    document.addEventListener('click', function (e) {
      const btn      = document.getElementById('profileBtn');
      const dropdown = document.getElementById('profileDropdown');
      if (!btn || !dropdown) return;

      if (btn.contains(e.target)) {
        const isOpen = dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(isOpen));
      } else if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Wire up logout
    document.addEventListener('click', async function (e) {
      if (e.target && e.target.id === 'logoutBtn') {
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } finally {
          window.location.href = '/index.html';
        }
      }
    });
  }

  /* ── Mobile drawer toggle ───────────────────────────────────── */
  function initMobileNav() {
    var hamburger = document.getElementById('navHamburger');
    var drawer    = document.getElementById('navDrawer');
    if (!hamburger || !drawer) return;

    hamburger.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', function (e) {
      if (drawer.classList.contains('open') &&
          !drawer.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeDrawer();
      }
    });

    function closeDrawer() {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  /* ── Nav scroll effect ──────────────────────────────────────── */
  function initScrollEffect() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll Reveal ──────────────────────────────────────────── */
  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ── Init ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initMobileNav();
    initScrollEffect();
    initScrollReveal();
    initAuthCta();
  });

})();


/* =================================================================
   PARTICLE NETWORK
   ================================================================= */
class Particle {
  constructor(canvas) {
    this.canvas  = canvas;
    this.x       = Math.random() * canvas.width;
    this.y       = Math.random() * canvas.height;
    this.vx      = (Math.random() - 0.5) * 0.3;
    this.vy      = (Math.random() - 0.5) * 0.3;
    this.life    = 2.0;
    this.maxLife = 6 + Math.random() * 4;
    this.age     = 0;
    this.size    = 2 + Math.random() * 2;
  }

  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
    this.age += deltaTime;

    if (this.age < 0.5) {
      this.life = this.age / 0.5;
    } else if (this.age > this.maxLife - 1) {
      this.life = this.maxLife - this.age;
    }

    if (this.x < 0 || this.x > this.canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height)  this.vy *= -1;

    return this.age < this.maxLife;
  }

  getBaseColor() { return '140, 170, 200'; }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.getBaseColor()}, ${this.life * 0.6})`;
    ctx.fill();
  }
}

class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx                = this.canvas.getContext('2d');
    this.particles          = [];
    this.maxParticles       = 100;
    this.connectionDistance = 240;
    this.spawnInterval      = 500;
    this.lastSpawn          = 0;
    this.lastTime           = Date.now();

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnParticle() {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(new Particle(this.canvas));
    }
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1   = this.particles[i];
        const p2   = this.particles[j];
        const dx   = p1.x - p2.x;
        const dy   = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDistance) {
          const opacity = (1 - dist / this.connectionDistance) *
                          Math.min(p1.life, p2.life) * 0.3;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(150, 150, 200, ${opacity})`;
          this.ctx.lineWidth   = 1;
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    const currentTime = Date.now();
    const deltaTime   = (currentTime - this.lastTime) / 1000;
    this.lastTime     = currentTime;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (currentTime - this.lastSpawn > this.spawnInterval) {
      this.spawnParticle();
      this.lastSpawn = currentTime;
    }

    this.particles = this.particles.filter(p => {
      const alive = p.update(deltaTime);
      if (alive) p.draw(this.ctx);
      return alive;
    });

    this.drawConnections();
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ParticleNetwork('particleCanvas');
});