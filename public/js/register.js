/* =================================================================
   REGISTER PAGE JS
   - Auth tab switching (register / log in)
   - Form submission via /api/auth/register and /api/auth/login
   - Redirects to dashboard on success
   ================================================================= */
(function () {
  'use strict';

  /* ── Common / weak passwords ────────────────────────────────── */
  const COMMON_PASSWORDS = new Set([
    '12345678','123456789','1234567890','password','password1','password123',
    'qwerty123','qwertyuiop','iloveyou','abc12345','admin123','welcome1',
    'monkey123','dragon123','master123','sunshine','princess','football',
    'superman','batman123','letmein1','trustno1','shadow12','michael1',
    'jessica1','charlie1','donald123','passw0rd','p@ssword','p@ssw0rd',
    '11111111','00000000','99999999','55555555','88888888','12341234',
    'abcd1234','test1234','hello123','login123','changeme','mustang1',
    'access12','starwars','whatever','baseball','soccer123','hockey123',
  ]);

  /* ── Suspicious / fake institution patterns ─────────────────── */
  const FAKE_INST_PATTERNS = [
    /^(n\/a|na|none|null|nil|nope|no|not applicable)$/i,
    /^(test|testing|asdf|qwerty|abcd|1234|xxxx|zzzz|dummy|fake|random)$/i,
    /^(.)\1{4,}$/,
    /^[\W\d]+$/,
  ];
  const MIN_INST_WORDS = 2;

  /* ── Bangladesh phone validation ────────────────────────────── */
  const BD_PHONE_RE = /^01[3-9]\d{8}$/;

  function validateBdPhone(raw) {
    const cleaned = raw.replace(/[\s\-().]/g, '').replace(/^(\+?880)/, '0');
    return BD_PHONE_RE.test(cleaned) ? cleaned : null;
  }

  /* ── Institution heuristic ──────────────────────────────────── */
  function validateInstitution(value) {
    const v = value.trim();
    if (v.length < 4) return false;
    for (const pattern of FAKE_INST_PATTERNS) {
      if (pattern.test(v)) return false;
    }
    const words = v.split(/\s+/).filter(w => /[a-zA-Z\u0980-\u09FF]/.test(w));
    return words.length >= MIN_INST_WORDS;
  }

  /* ── Password strength ──────────────────────────────────────── */
  function validatePassword(pw) {
    if (pw.length < 8)                          return 'Password must be at least 8 characters.';
    if (COMMON_PASSWORDS.has(pw.toLowerCase())) return 'This password is too common. Please choose a stronger one.';
    if (!/[A-Za-z]/.test(pw))                  return 'Password must contain at least one letter.';
    if (!/\d/.test(pw))                         return 'Password must contain at least one number.';
    return null;
  }

  /* ── Config: OTP on registration ───────────────────────────── */
  let OTP_REQUIRED_ON_REGISTRATION = true;
  let IS_REGISTRATION_CLOSED = false;

  async function fetchConfig() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        OTP_REQUIRED_ON_REGISTRATION = data.USER_OPT_ON_REGISTRATION === true;
        IS_REGISTRATION_CLOSED = data.IS_REGISTRATION_CLOSED === true;
      }
    } catch (e) {
      console.warn('[register.js] Could not fetch config, defaulting to OTP required');
    }
  }

  /* ================================================================
     DOM-READY
  ================================================================= */
  document.addEventListener('DOMContentLoaded', async function () {
    await fetchConfig();

    // Show registration closed overlay if enabled
    if (IS_REGISTRATION_CLOSED) {
      const overlay = document.getElementById('registrationClosedOverlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
      }
    }

    const tabs  = document.querySelectorAll('.auth-tab[data-tab]');
    const forms = document.querySelectorAll('.auth-form[data-form]');

    function switchTo(tab) {
      tabs.forEach(t  => t.classList.toggle('active', t.getAttribute('data-tab') === tab));
      forms.forEach(f => f.classList.toggle('active', f.getAttribute('data-form') === tab));
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { switchTo(tab.getAttribute('data-tab')); });
    });

    document.querySelectorAll('[data-switch-tab]').forEach(function (el) {
      el.addEventListener('click', function () { switchTo(el.getAttribute('data-switch-tab')); });
    });

    /* ── Helpers ────────────────────────────────────────────── */
    function setLoading(btn, isLoading) {
      btn.disabled    = isLoading;
      btn.textContent = isLoading ? 'Please wait…' : btn.dataset.originalText;
    }

    function showFormError(formEl, message) {
      let errDiv = formEl.querySelector('.form-api-error');
      if (!errDiv) {
        errDiv           = document.createElement('div');
        errDiv.className = 'form-api-error';
        formEl.prepend(errDiv);
      }
      errDiv.textContent   = message;
      errDiv.style.display = 'block';
    }

    function clearFormError(formEl) {
      const errDiv = formEl.querySelector('.form-api-error');
      if (errDiv) errDiv.style.display = 'none';
    }

    function fieldError(inputEl, message) {
      inputEl.classList.add('input-error');
      let span = inputEl.parentElement.querySelector('.field-error-msg');
      if (!span) {
        span           = document.createElement('span');
        span.className = 'field-error-msg';
        span.style.cssText = 'color:#e05252;font-size:.75rem;margin-top:4px;display:block;';
        inputEl.parentElement.appendChild(span);
      }
      span.textContent = message;
    }

    function clearFieldError(inputEl) {
      inputEl.classList.remove('input-error');
      const span = inputEl.parentElement.querySelector('.field-error-msg');
      if (span) span.textContent = '';
    }

    function clearAllFieldErrors(formEl) {
      formEl.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
      formEl.querySelectorAll('.field-error-msg').forEach(el => { el.textContent = ''; });
    }

    function showModalError(modalEl, message) {
      let errDiv = modalEl.querySelector('.form-api-error');
      if (!errDiv) {
        errDiv           = document.createElement('div');
        errDiv.className = 'form-api-error';
        errDiv.style.cssText = 'color:#e05252;font-size:.85rem;margin-top:16px;display:block;';
        modalEl.appendChild(errDiv);
      }
      errDiv.textContent   = message;
      errDiv.style.display = 'block';
    }

    function clearModalError(modalEl) {
      const errDiv = modalEl.querySelector('.form-api-error');
      if (errDiv) errDiv.style.display = 'none';
    }

    /* ── Registration submit ────────────────────────────────── */
    /* ── Registration: 3-step OTP flow ─────────────────────────
       Step 1 – validate form fields, send OTP to email
       Step 2 – verify OTP, then POST /api/auth/register        */

    const formEl     = document.querySelector('.auth-form[data-form="register"]');
    const regStep1   = document.getElementById('regStep1');
    const regStep2   = document.getElementById('regStep2');
    const regEmailConfirm = document.getElementById('regEmailConfirm');
    const sendOtpBtn = document.getElementById('regSendOtpBtn');
    const confirmEmailSendOtpBtn = document.getElementById('confirmEmailSendOtpBtn');
    const editEmailBtn = document.getElementById('editEmailBtn');
    const verifyBtn  = document.getElementById('regVerifyOtpBtn');
    const resendBtn  = document.getElementById('regResendOtpBtn');
    const backBtn    = document.getElementById('regBackBtn');

    // Cached form payload – built in step 1, reused in step 2
    let _regPayload = null;

    /* Helper – collect & validate all fields; returns payload or null */
    function buildAndValidatePayload() {
      clearFormError(formEl);
      clearAllFieldErrors(formEl);

      const nameEl      = document.getElementById('reg-name');
      const emailEl     = document.getElementById('reg-email');
      const phoneEl     = document.getElementById('reg-phone');
      const instEl      = document.getElementById('reg-inst');
      const divisionEl  = document.getElementById('reg-division');
      const classEl     = document.getElementById('reg-class');
      const addressEl   = document.getElementById('reg-address');
      const passEl      = document.getElementById('reg-pass');
      const pass2El     = document.getElementById('reg-pass2');
      const refEl       = document.getElementById('reg-ref');
      const clubRefEl   = document.getElementById('reg-club-ref');

      const name        = nameEl?.value.trim()    || '';
      const email       = emailEl?.value.trim()   || '';
      const phoneRaw    = phoneEl?.value.trim()   || '';
      const inst        = instEl?.value.trim()    || '';
      const division    = divisionEl?.value       || '';
      const studentClass = classEl?.value         || '';
      const address     = addressEl?.value.trim() || '';
      const password    = passEl?.value           || '';
      const confirm     = pass2El?.value          || '';
      const refCode     = refEl?.value.trim()     || '';
      const clubRefCode = clubRefEl?.value.trim() || '';

      let hasError = false;

      if (name.length < 3)                              { fieldError(nameEl,  'Please enter your full name.'); hasError = true; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fieldError(emailEl, 'Please enter a valid email address.'); hasError = true; }

      const cleanedPhone = validateBdPhone(phoneRaw);
      if (!cleanedPhone) { fieldError(phoneEl, 'Enter a valid Bangladeshi number (e.g. 01XXXXXXXXX — 11 digits).'); hasError = true; }

      if (!validateInstitution(inst)) { fieldError(instEl, 'Please enter a real institution name (e.g. "Notre Dame College").'); hasError = true; }
      if (!division)                  { fieldError(divisionEl, 'Please select your division.'); hasError = true; }
      if (!studentClass)              { fieldError(classEl,    'Please select your class.'); hasError = true; }
      if (address.length < 5)        { fieldError(addressEl,  'Please enter your address.'); hasError = true; }

      const pwError = validatePassword(password);
      if (pwError)                   { fieldError(passEl,  pwError); hasError = true; }
      if (!hasError && password !== confirm) { fieldError(pass2El, 'Passwords do not match.'); hasError = true; }

      if (hasError) return null;

      return {
        full_name:      name,
        email:          email,
        phone:          cleanedPhone,
        institution:    inst,
        division:       division,
        student_class:  studentClass,
        address:        address,
        blood_group:    document.getElementById('reg-blood')?.value,
        gender:         document.getElementById('reg-gender')?.value,
        password:       password,
        cr_dr_ref_code: refCode     || undefined,
        club_ref_code:  clubRefCode || undefined,
      };
    }

    /* Step 1 – show email confirmation modal OR direct register if OTP disabled */
    function doSendOtp() {
      const payload = buildAndValidatePayload();
      if (!payload) return;
      _regPayload = payload;

      // If OTP is disabled, register directly
      if (!OTP_REQUIRED_ON_REGISTRATION) {
        doDirectRegister(payload);
        return;
      }

      // Show confirmation modal with the email
      regStep1.style.display = 'none';
      regEmailConfirm.style.display = 'block';
      document.getElementById('confirmEmailDisplay').textContent = payload.email;
      clearFormError(formEl);
    }

    /* Direct registration (no OTP) */
    async function doDirectRegister(payload) {
      const btn = document.getElementById('regSendOtpBtn');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Creating account…';

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.ok) {
          window.location.href = '/dashboard.html';
        } else {
          showFormError(formEl, data.message || 'Registration failed. Please try again.');
          btn.disabled = false;
          btn.textContent = originalText;
        }
      } catch (err) {
        showFormError(formEl, 'Network error. Please check your connection and try again.');
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }

    /* Step 1.5 – user confirmed, now send OTP */
    async function doConfirmAndSendOtp() {
      if (!_regPayload) {
        showFormError(formEl, 'Session expired. Please go back and fill the form again.');
        return;
      }

      confirmEmailSendOtpBtn.disabled    = true;
      confirmEmailSendOtpBtn.textContent = 'Sending OTP…';

      try {
        const res  = await fetch('/api/auth/send-registration-otp', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify({ email: _regPayload.email }),
        });
        const data = await res.json();

        if (data.ok) {
          // Show OTP verification step
          regEmailConfirm.style.display = 'none';
          regStep2.style.display = 'block';
          document.getElementById('regOtpEmailDisplay').textContent = _regPayload.email;
          document.getElementById('reg-otp').value = '';
          document.getElementById('reg-otp').focus();
          clearFormError(formEl);
          clearModalError(regEmailConfirm);
        } else {
          // Show error and let user retry
          regEmailConfirm.style.display = 'block';
          const errorMsg = res.status === 409
            ? (data.message || 'This email is already registered. Please log in instead.')
            : (data.message || 'Failed to send OTP. Please try again.');
          showFormError(formEl, errorMsg);
          showModalError(regEmailConfirm, errorMsg);
        }
      } catch (err) {
        regEmailConfirm.style.display = 'block';
        const errorMsg = 'Network error. Please check your connection and try again.';
        showFormError(formEl, errorMsg);
        showModalError(regEmailConfirm, errorMsg);
      } finally {
        confirmEmailSendOtpBtn.disabled    = false;
        confirmEmailSendOtpBtn.textContent = 'Yes, Send OTP';
      }
    }

    /* Edit email – go back to form */
    function doEditEmail() {
      regEmailConfirm.style.display = 'none';
      regStep1.style.display = 'block';
      clearFormError(formEl);
      // Focus the email field for easy editing
      const emailEl = document.getElementById('reg-email');
      if (emailEl) {
        emailEl.focus();
        emailEl.select();
      }
    }

    /* Step 2 – verify OTP then register */
    async function doVerifyAndRegister() {
      const otp = document.getElementById('reg-otp')?.value.trim();
      if (!otp || otp.length !== 6) {
        showFormError(formEl, 'Please enter the 6-digit OTP sent to your email.');
        return;
      }
      if (!_regPayload) {
        showFormError(formEl, 'Session expired. Please go back and fill the form again.');
        return;
      }

      verifyBtn.disabled    = true;
      verifyBtn.textContent = 'Verifying…';

      try {
        // 2a. Verify OTP
        const otpRes  = await fetch('/api/auth/verify-registration-otp', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: _regPayload.email, otp }),
        });
        const otpData = await otpRes.json();

        if (!otpData.ok) {
          showFormError(formEl, otpData.message || 'Invalid or expired OTP. Please try again.');
          verifyBtn.disabled    = false;
          verifyBtn.textContent = 'Verify & Create Account';
          return;
        }

        // 2b. Complete registration
        verifyBtn.textContent = 'Creating account…';
        const regRes  = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify(_regPayload),
        });
        const regData = await regRes.json();

        if (regData.ok) {
          window.location.href = '/dashboard.html';
        } else {
          showFormError(formEl, regData.message || 'Registration failed. Please try again.');
          verifyBtn.disabled    = false;
          verifyBtn.textContent = 'Verify & Create Account';
        }
      } catch (err) {
        showFormError(formEl, 'Network error. Please check your connection and try again.');
        verifyBtn.disabled    = false;
        verifyBtn.textContent = 'Verify & Create Account';
      }
    }

    // Update button text based on OTP setting
    if (sendOtpBtn) {
      sendOtpBtn.textContent = OTP_REQUIRED_ON_REGISTRATION ? 'Verify Email & Continue' : 'Create Account';
      sendOtpBtn.addEventListener('click', doSendOtp);
    }
    if (confirmEmailSendOtpBtn) confirmEmailSendOtpBtn.addEventListener('click', doConfirmAndSendOtp);
    if (editEmailBtn) editEmailBtn.addEventListener('click', doEditEmail);
    if (verifyBtn)  verifyBtn.addEventListener('click', doVerifyAndRegister);

    // Resend OTP – reuse step-1 logic
    if (resendBtn) resendBtn.addEventListener('click', async function () {
      if (!_regPayload) { showFormError(formEl, 'Please go back and fill the form again.'); return; }
      resendBtn.disabled = true;
      resendBtn.textContent = 'Sending…';
      try {
        const res  = await fetch('/api/auth/send-registration-otp', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify({ email: _regPayload.email }),
        });
        const data = await res.json();
        if (data.ok) {
          showFormError(formEl, '✓ A new OTP has been sent to your email.');
          // Clear the message after 3 seconds
          setTimeout(() => clearFormError(formEl), 3000);
        } else {
          showFormError(formEl, data.message || 'Failed to resend OTP.');
        }
      } catch { showFormError(formEl, 'Network error. Please try again.'); }
      finally { resendBtn.disabled = false; resendBtn.textContent = 'Resend OTP'; }
    });

    // Back button – return to form step
    if (backBtn) backBtn.addEventListener('click', function () {
      regStep2.style.display = 'none';
      regEmailConfirm.style.display = 'none';
      regStep1.style.display = 'block';
      clearFormError(formEl);
    });

    /* ── Login submit (password) ──────────────────────────── */
    /* ── Login submit (password) ──────────────────────────── */
    const logBtn = document.querySelector('[data-form-submit="login"]');
    if (logBtn) {
      logBtn.dataset.originalText = logBtn.textContent;
      logBtn.addEventListener('click', async function () {
        const formEl = document.querySelector('.auth-form[data-form="login"]');
        clearFormError(formEl);
        setLoading(logBtn, true);
        const payload = {
          email:    document.getElementById('log-email')?.value.trim(),
          password: document.getElementById('log-pass')?.value,
        };
        try {
          const res  = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.ok) { window.location.href = '/dashboard.html'; }
          else { showFormError(formEl, data.message || 'Login failed. Please try again.'); }
        } catch (err) { showFormError(formEl, 'Network error. Please check your connection and try again.'); }
        finally { setLoading(logBtn, false); }
      });
    }

    /* ── OTP / Forgot password toggle ─────────────────────── */
    const $loginStep1      = document.getElementById('loginStep1');
    const $loginStepOtp    = document.getElementById('loginStepOtp');
    const $loginStepForgot = document.getElementById('loginStepForgot');

    function showPanel(panel) {
      [$loginStep1, $loginStepOtp, $loginStepForgot].forEach(p => { if (p) p.style.display = 'none'; });
      if (panel) panel.style.display = 'block';
    }

    document.getElementById('showOtpLoginBtn')?.addEventListener('click', () => {
      showPanel($loginStepOtp);
      // Reset OTP login to step 1
      $loginOtpStep1.style.display = 'block';
      $loginOtpConfirm.style.display = 'none';
      $otpCodeGroup.style.display = 'none';
    });
    document.getElementById('backToPasswordLogin')?.addEventListener('click', () => {
      showPanel($loginStep1);
      // Reset OTP login to step 1
      $loginOtpStep1.style.display = 'block';
      $loginOtpConfirm.style.display = 'none';
      $otpCodeGroup.style.display = 'none';
    });
    document.getElementById('showForgotBtn')?.addEventListener('click', () => showPanel($loginStepForgot));
    document.getElementById('backFromForgot')?.addEventListener('click', () => showPanel($loginStep1));

    /* ── Send OTP for OTP-login ────────────────────────────── */
    const $loginOtpStep1    = document.getElementById('loginOtpStep1');
    const $loginOtpConfirm  = document.getElementById('loginOtpConfirm');
    const $otpCodeGroup     = document.getElementById('otpCodeGroup');
    const $sendOtpBtn       = document.getElementById('sendOtpBtn');
    const $loginConfirmSendOtpBtn = document.getElementById('loginConfirmSendOtpBtn');
    const $loginEditEmailBtn      = document.getElementById('loginEditEmailBtn');
    const $verifyOtpBtn       = document.getElementById('verifyOtpBtn');

    // Step 1: Show email confirmation modal
    if ($sendOtpBtn) {
      $sendOtpBtn.dataset.originalText = 'Send OTP';
      $sendOtpBtn.addEventListener('click', function () {
        const formEl = document.querySelector('.auth-form[data-form="login"]');
        clearFormError(formEl);
        const email = document.getElementById('otp-email')?.value.trim();
        if (!email) { showFormError(formEl, 'Please enter your email.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFormError(formEl, 'Please enter a valid email address.'); return; }
        // Show confirmation modal
        $loginOtpStep1.style.display = 'none';
        $loginOtpConfirm.style.display = 'block';
        document.getElementById('loginConfirmEmailDisplay').textContent = email;
      });
    }

    // Step 1.5: User confirmed, send OTP
    if ($loginConfirmSendOtpBtn) {
      $loginConfirmSendOtpBtn.dataset.originalText = 'Yes, Send OTP';
      $loginConfirmSendOtpBtn.addEventListener('click', async function () {
        const formEl = document.querySelector('.auth-form[data-form="login"]');
        clearFormError(formEl);
        clearModalError($loginOtpConfirm);
        const email = document.getElementById('otp-email')?.value.trim();
        setLoading($loginConfirmSendOtpBtn, true);
        try {
          const res  = await fetch('/api/auth/send-otp', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (data.ok) {
            $loginOtpConfirm.style.display = 'none';
            $otpCodeGroup.style.display = 'block';
            const successMsg = '✓ OTP sent to ' + email + '. Check your inbox.';
            showFormError(formEl, successMsg);
            showModalError($loginOtpConfirm, successMsg);
          } else {
            $loginOtpConfirm.style.display = 'block';
            const errorMsg = data.message || 'Failed to send OTP.';
            showFormError(formEl, errorMsg);
            showModalError($loginOtpConfirm, errorMsg);
          }
        } catch {
          $loginOtpConfirm.style.display = 'block';
          const errorMsg = 'Network error.';
          showFormError(formEl, errorMsg);
          showModalError($loginOtpConfirm, errorMsg);
        }
        finally { setLoading($loginConfirmSendOtpBtn, false); }
      });
    }

    // Edit email – go back to input
    if ($loginEditEmailBtn) {
      $loginEditEmailBtn.addEventListener('click', function () {
        $loginOtpConfirm.style.display = 'none';
        $loginOtpStep1.style.display = 'block';
        const emailEl = document.getElementById('otp-email');
        if (emailEl) {
          emailEl.focus();
          emailEl.select();
        }
      });
    }

    if ($verifyOtpBtn) {
      $verifyOtpBtn.dataset.originalText = 'Verify & Log In';
      $verifyOtpBtn.addEventListener('click', async function () {
        const formEl = document.querySelector('.auth-form[data-form="login"]');
        clearFormError(formEl);
        const email = document.getElementById('otp-email')?.value.trim();
        const otp   = document.getElementById('otp-code')?.value.trim();
        if (!otp) { showFormError(formEl, 'Please enter the OTP code.'); return; }
        setLoading($verifyOtpBtn, true);
        try {
          const res  = await fetch('/api/auth/verify-otp', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ email, otp }),
          });
          const data = await res.json();
          if (data.ok) { window.location.href = '/dashboard.html'; }
          else { showFormError(formEl, data.message || 'Invalid or expired OTP.'); }
        } catch { showFormError(formEl, 'Network error.'); }
        finally { setLoading($verifyOtpBtn, false); }
      });
    }

    /* ── Forgot password ───────────────────────────────────── */
    const $sendFpOtpBtn = document.getElementById('sendFpOtpBtn');
    const $fpStep2      = document.getElementById('fpStep2');
    const $resetPassBtn = document.getElementById('resetPassBtn');

    if ($sendFpOtpBtn) {
      $sendFpOtpBtn.dataset.originalText = 'Send Reset OTP';
      $sendFpOtpBtn.addEventListener('click', async function () {
        const formEl = document.querySelector('.auth-form[data-form="login"]');
        clearFormError(formEl);
        const email = document.getElementById('fp-email')?.value.trim();
        if (!email) { showFormError(formEl, 'Please enter your email.'); return; }
        setLoading($sendFpOtpBtn, true);
        try {
          const res  = await fetch('/api/auth/forgot-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (data.ok) { $fpStep2.style.display = 'block'; showFormError(formEl, '✓ If that email is registered, an OTP has been sent.'); }
          else { showFormError(formEl, data.message || 'Failed to send OTP.'); }
        } catch { showFormError(formEl, 'Network error.'); }
        finally { setLoading($sendFpOtpBtn, false); }
      });
    }

    if ($resetPassBtn) {
      $resetPassBtn.dataset.originalText = 'Reset Password';
      $resetPassBtn.addEventListener('click', async function () {
        const formEl = document.querySelector('.auth-form[data-form="login"]');
        clearFormError(formEl);
        const email    = document.getElementById('fp-email')?.value.trim();
        const otp      = document.getElementById('fp-otp')?.value.trim();
        const newPass  = document.getElementById('fp-newpass')?.value;
        const newPass2 = document.getElementById('fp-newpass2')?.value;
        if (!otp || !newPass || !newPass2) { showFormError(formEl, 'Please fill in all fields.'); return; }
        if (newPass !== newPass2) { showFormError(formEl, 'Passwords do not match.'); return; }
        const pwErr = validatePassword(newPass);
        if (pwErr) { showFormError(formEl, pwErr); return; }
        setLoading($resetPassBtn, true);
        try {
          const res  = await fetch('/api/auth/reset-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify({ email, otp, newPassword: newPass }),
          });
          const data = await res.json();
          if (data.ok) {
            showFormError(formEl, '✓ Password reset! You can now log in.');
            showPanel($loginStep1);
          } else { showFormError(formEl, data.message || 'Failed to reset password.'); }
        } catch { showFormError(formEl, 'Network error.'); }
        finally { setLoading($resetPassBtn, false); }
      });
    }
  });
})();