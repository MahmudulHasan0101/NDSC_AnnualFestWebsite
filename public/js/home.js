/* =================================================================
   HOME PAGE JS — Countdown Timer + Auth-aware hero CTA
   ================================================================= */

(function () {
  'use strict';

  const DEADLINE = new Date('2026-04-08T23:59:59');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = DEADLINE - Date.now();

    if (diff <= 0) {
      ['days','hours','mins','secs'].forEach(id => {
        const el = document.getElementById('cd-' + id);
        if (el) el.textContent = '00';
      });
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const els = {
      days:  document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins:  document.getElementById('cd-mins'),
      secs:  document.getElementById('cd-secs'),
    };

    if (els.days)  els.days.textContent  = pad(d);
    if (els.hours) els.hours.textContent = pad(h);
    if (els.mins)  els.mins.textContent  = pad(m);
    if (els.secs)  els.secs.textContent  = pad(s);
  }

  /* ── Auth-aware hero CTA ────────────────────────────────────────
     common.js already handles the nav bar. This handles the
     "Register Now" button inside the hero section.
     If logged in → swap to "Go to Dashboard" pointing at dashboard.html.
     The fetch piggybacks on the same session cookie common.js uses,
     so the browser re-uses the cached response — no extra round-trip cost.
  ─────────────────────────────────────────────────────────────── */
  async function initHeroCta() {
    // The primary CTA inside .cta-row
    const primaryBtn = document.querySelector('.cta-row .btn--primary');
    if (!primaryBtn) return;

    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return; // 401 = guest, leave button as-is

      const data = await res.json();
      const user = data.data?.user ?? null;
      if (!user) return;

      // User is logged in — replace register button with dashboard link
      primaryBtn.href      = '/dashboard.html';
      primaryBtn.innerHTML = `Go to Dashboard
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

    } catch { /* offline / server down — leave button as-is */ }
  }

  document.addEventListener('DOMContentLoaded', function () {
    tick();
    setInterval(tick, 1000);
    initHeroCta();
  });
})();