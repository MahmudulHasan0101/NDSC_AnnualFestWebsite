/**
 * js/segmentRegister.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Shared logic consumed by every segment registration page.
 *
 * Each page calls:
 *   initSegmentRegister(config)
 *
 * config = {
 *   segment    : string   — API slug (e.g. 'projectexpo')
 *   enrollBtn  : string   — selector for the enroll button
 *   getExtra   : fn()     — optional; returns extra body fields or null on error
 *   onReady    : fn(user) — optional; called once auth confirmed, to populate UI
 * }
 *
 * Payment fields (injected automatically into every page via #paymentSection):
 *   transaction_id      — bKash transaction ID from the Send Money receipt
 *   send_money_datetime — approximate date+time of the transfer
 *
 * Both fields are collected by collectPayment() and merged into the POST body.
 * The server stores them alongside verified=false; an admin marks verified=true later.
 */

'use strict';

const API = {
  me:     '/api/auth/me',
  status: (seg)   => `/api/segments/${seg}/status`,
  enroll: (seg)   => `/api/segments/${seg}/register`,
};

/* ── Fetch wrapper ───────────────────────────────────────────────────────────*/
async function apiFetch(url, options = {}) {
  try {
    const res  = await fetch(url, { credentials: 'include', ...options });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status };
  } catch {
    return { ok: false, data: {}, status: 0 };
  }
}

/* ── Status banner ───────────────────────────────────────────────────────────*/
function showBanner(message, type = 'info') {
  const el = document.getElementById('statusBanner');
  if (!el) return;
  el.className = `status-banner status-banner--${type}`;
  el.textContent = message;
  el.style.display = 'flex';
  if (type === 'success') {
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
}

function hideBanner() {
  const el = document.getElementById('statusBanner');
  if (el) el.style.display = 'none';
}

/* ── Payment section HTML ────────────────────────────────────────────────────
   Injected before #statusBanner on every page.
   Styles are inlined so no extra CSS file is needed.
──────────────────────────────────────────────────────────────────────────── */
const PAYMENT_HTML = `
<div id="paymentSection" style="
  border-top: 1px solid var(--border-subtle);
  padding-top: 24px;
  margin-top: 8px;
  margin-bottom: 24px;
">
  <!-- Info banner -->
  <div style="
    background: rgba(157,92,255,.08);
    border: 1px solid rgba(157,92,255,.25);
    border-radius: var(--radius-m);
    padding: 14px 18px;
    margin-bottom: 22px;
    font-size: .82rem;
    line-height: 1.7;
    color: var(--text-secondary);
  ">
    <span style="
      display: block;
      font-family: var(--font-mono);
      font-size: .6rem;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--accent-bright);
      margin-bottom: 6px;
    ">Registration Process</span>
    Send <strong>BDT 100</strong> via bKash <em>(Send Money)</em> to
    <strong style="color:var(--accent-bright); letter-spacing:.04em;">01511550048</strong>
    and complete the registration on this portal using your payment details.
  </div>

  <p style="
    font-family: var(--font-mono);
    font-size: .65rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 18px;
  ">Payment details</p>

  <!-- bKash transaction ID -->
  <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:18px;">
    <label for="transactionId" style="
      font-family: var(--font-mono);
      font-size: .65rem;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: var(--text-muted);
    ">bKash transaction ID</label>
    <input
      id="transactionId"
      type="text"
      maxlength="10"
      placeholder="e.g. AB12CD3456"
      autocomplete="off"
      style="
        background: var(--bg-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-m);
        padding: 12px 16px;
        font-family: var(--font-body);
        font-size: .88rem;
        color: var(--text-primary);
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color var(--duration-s);
      "
    />
    <span id="transactionIdError" style="font-size:.75rem;color:#fca5a5;display:none;">
      Please enter the bKash transaction ID for your payment.
    </span>
  </div>

  <!-- Date + time -->
  <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:4px;">
    <label for="sendMoneyDatetime" style="
      font-family: var(--font-mono);
      font-size: .65rem;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: var(--text-muted);
    ">Approximate date &amp; time of payment</label>
    <input
      id="sendMoneyDatetime"
      type="datetime-local"
      style="
        background: var(--bg-raised);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-m);
        padding: 12px 16px;
        font-family: var(--font-body);
        font-size: .88rem;
        color: var(--text-primary);
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color var(--duration-s);
        color-scheme: dark;
      "
    />
    <span id="sendMoneyDatetimeError" style="font-size:.75rem;color:#fca5a5;display:none;">
      Please provide the approximate date and time of your payment.
    </span>
  </div>
</div>
`;

/* ── Inject payment section + focus styles ───────────────────────────────────*/
function injectPaymentSection() {
  // If the page already has a #paymentSection (e.g. hard-coded in HTML), skip injection
  if (document.getElementById('paymentSection')) return;
  const banner = document.getElementById('statusBanner');
  if (!banner) return;
  banner.insertAdjacentHTML('beforebegin', PAYMENT_HTML);

  // Add focus border-color via JS (can't use :focus in inline styles)
  ['transactionId', 'sendMoneyDatetime'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('focus', () => { el.style.borderColor = 'var(--accent)'; });
    el.addEventListener('blur',  () => { el.style.borderColor = 'var(--border-default)'; });
  });
}

/* ── Collect & validate payment fields ───────────────────────────────────────
   Returns { transaction_id, send_money_datetime } or null on validation fail.
──────────────────────────────────────────────────────────────────────────── */
function collectPayment() {
  const txEl   = document.getElementById('transactionId');
  const dtEl   = document.getElementById('sendMoneyDatetime');
  const txErr  = document.getElementById('transactionIdError');
  const dtErr  = document.getElementById('sendMoneyDatetimeError');

  let valid = true;

  const tx = txEl?.value.trim() || '';
  if (!tx) {
    if (txErr) txErr.style.display = 'block';
    if (txEl)  txEl.style.borderColor = 'rgba(248,113,113,.6)';
    valid = false;
  } else {
    if (txErr) txErr.style.display = 'none';
    if (txEl)  txEl.style.borderColor = 'var(--border-default)';
  }

  const dt = dtEl?.value || '';
  if (!dt) {
    if (dtErr) dtErr.style.display = 'block';
    if (dtEl)  dtEl.style.borderColor = 'rgba(248,113,113,.6)';
    valid = false;
  } else {
    if (dtErr) dtErr.style.display = 'none';
    if (dtEl)  dtEl.style.borderColor = 'var(--border-default)';
  }

  if (!valid) return null;
  return { transaction_id: tx, send_money_datetime: dt };
}

/* ── Main initialiser ────────────────────────────────────────────────────────*/
async function initSegmentRegister({ segment, enrollBtn: btnSelector, getExtra, onReady }) {
  const btn         = document.querySelector(btnSelector || '#enrollBtn');
  const loadingWrap = document.getElementById('pageLoading');
  const authError   = document.getElementById('authError');
  const pageContent = document.getElementById('pageContent');

  function setLoading(state) {
    if (btn) {
      btn.disabled = state;
      btn.dataset.loading = state ? 'true' : 'false';
    }
  }

  // ── 1. Auth check ───────────────────────────────────────────────────────────
  const { ok: authed, data: meData } = await apiFetch(API.me);

  if (loadingWrap) loadingWrap.style.display = 'none';

  if (!authed || !meData?.data?.user) {
    if (authError)   authError.style.display   = 'flex';
    if (pageContent) pageContent.style.display = 'none';
    return;
  }

  const user = meData.data.user;
  if (pageContent) pageContent.style.display = 'block';

  // Populate greeting if present
  const greetEl = document.getElementById('userGreeting');
  if (greetEl) greetEl.textContent = user.full_name;

  // Hook for page-specific setup
  if (typeof onReady === 'function') onReady(user);

  // ── 2. Inject payment section (Conundrum Paradox only) ──────────────────────
  if (segment === 'conundrumparadox') {
    injectPaymentSection();
  }

  // ── 3. Already enrolled? ────────────────────────────────────────────────────
  const { ok: statusOk, data: statusData } = await apiFetch(API.status(segment));

  if (!statusOk) {
    showBanner('Unable to check registration status. Please refresh and try again.', 'error');
    if (btn) btn.disabled = true;
    return;
  }

  if (statusData?.data?.registered) {
    showBanner('You are already registered for this segment.', 'info');
    if (segment === 'conundrumparadox') {
      const ps = document.getElementById('paymentSection');
      if (ps) ps.style.display = 'none';
    }
    if (btn) {
      btn.disabled    = true;
      btn.textContent = 'Already Enrolled';
    }
    return;
  }

  // ── 4. Enroll handler ───────────────────────────────────────────────────────
  if (!btn) return;

  btn.addEventListener('click', async () => {
    hideBanner();

    // Collect segment-specific fields first (for CP this includes payment fields)
    let extra = {};
    if (typeof getExtra === 'function') {
      extra = getExtra();
      if (extra === null) return; // validation failed
    }

    setLoading(true);

    const { ok, data } = await apiFetch(API.enroll(segment), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(extra),
    });

    setLoading(false);

    if (ok) {
      showBanner(data.message || 'Successfully enrolled!', 'success');
      btn.disabled    = true;
      btn.textContent = 'Enrolled ✓';
      if (segment === 'conundrumparadox') {
        ['transactionId', 'sendMoneyDatetime'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.disabled = true;
        });
      }
    } else {
      const msg = data.message || 'Enrollment failed. Please try again.';
      showBanner(msg, 'error');
    }
  });
}

// Expose globally
window.initSegmentRegister = initSegmentRegister;