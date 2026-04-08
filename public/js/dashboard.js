/* =================================================================
   DASHBOARD PAGE JS  —  NDSC Annual Fest 2026
   Features:
     1. Profile card + profile details
     2. Segment enrollment modal → redirects to individual register pages
     3. Notifications panel (segment-scoped)
     4. QR code pass generation + download
     5. My Submissions section (Wall Magazine, Digital Poster, Project Expo)
   ================================================================= */
(function () {
  'use strict';

  /* ── Segment registry ───────────────────────────────────────────
     key:   display name shown in modal
     slug:  maps to <slug>_register.html
     desc:  short description for the card
  ─────────────────────────────────────────────────────────────── */
  const SEGMENTS = [
    { key: 'Project Expo',                     slug: 'projectexpo',      desc: 'Jagadish Chandra Bose · Jamal Nazrul Islam · Nikola Tesla' },
    { key: 'Wall Magazine',                    slug: 'wallmagazine',     desc: 'Art & Design' },
    { key: 'Digital Poster Designing',         slug: 'digitalposter',    desc: 'Art & Design' },
    { key: 'Scrapbook',                        slug: 'scrapbook',        desc: 'Art & Design' },
    { key: 'Conceptual Art',                   slug: 'conceptualart',    desc: 'Art & Design' },
    { key: 'Videography',                      slug: 'videography',      desc: 'Art & Design' },
    { key: 'Fr Timm Memorial Science Olympiad',slug: 'scienceolympiad',  desc: 'Scholar Hunt' },
    { key: 'Theorum Vault',                    slug: 'theoramvault',     desc: 'Scholar Hunt' },
    { key: 'Sci-Fi Story Writing',             slug: 'scifiwriting',     desc: 'Scholar Hunt' },
    { key: 'Sci-Nime Quiz',                    slug: 'scinimequiz',      desc: 'Scholar Hunt' },
    { key: 'Extempore Speech',                 slug: 'extempore',        desc: 'Scholar Hunt' },
    { key: "Rubik's Cube Solving",             slug: 'rubikscube',       desc: 'Seconds to Beat' },
    { key: 'Conundrum Paradox',                slug: 'conundrumparadox', desc: 'Conundrum Paradox' },
    { key: 'Robo Soccer',                      slug: 'robosoccer',       desc: 'Tech Con' },
    { key: 'Line Following Robot',             slug: 'linefollower',     desc: 'Tech Con' },
    { key: 'Google It',                        slug: 'googleit',         desc: 'Tech Con' },
    { key: 'Web Page Designing',               slug: 'webdesign',        desc: 'Tech Con' },
    // { key: 'Meme-o-logy',                      slug: 'memeology',        desc: 'Art & Design' },
    { key: 'Public Quiz',                      slug: 'publicquiz',       desc: 'Public Event' },
    { key: 'Team Based Quiz',                  slug: 'teamquiz',         desc: '35th GKC' },
    { key: 'Solo Quiz',                        slug: 'soloquiz',         desc: '35th GKC' },
    { key: 'Old School Quiz',                  slug: 'oldschoolquiz',    desc: '35th GKC' },
  ];

  /* ── State ──────────────────────────────────────────────────── */
  let state = {
    user:          null,
    enrollments:   [],
    registrations: [],
    submissions:   [],   // [{slug, label, page, submitted, detail}] from API
    notifications: [],
    qrGenerated:   false,
  };

  /* ── DOM refs ───────────────────────────────────────────────── */
  const $loading        = document.getElementById('dashboardLoading');
  const $authError      = document.getElementById('dashboardAuthError');
  const $content        = document.getElementById('dashboardContent');
  const $profileAvatar  = document.getElementById('profileAvatar');
  const $profileName    = document.getElementById('profileName');
  const $profileMeta    = document.getElementById('profileMeta');
  const $profileDetails = document.getElementById('profileDetails');
  const $enrolledBox    = document.getElementById('enrolledBox');
  const $enrollBtn      = document.getElementById('enrollBtn');
  const $submissionsBox = document.getElementById('submissionsBox');
  const $submissionsCard= document.getElementById('submissionsCard');
  const $notifList      = document.getElementById('notifList');
  const $notifBadge     = document.getElementById('notifBadge');
  const $notifToggleBtn = document.getElementById('notifToggleBtn');
  const $notifCard      = document.getElementById('notifCard');
  const $downloadQrBtn  = document.getElementById('downloadQrBtn');
  const $logoutBtnDash  = document.getElementById('logoutBtnDash');

  // Modal
  const $modal          = document.getElementById('enrollModal');
  const $modalBody      = document.getElementById('modalBody');
  const $modalCloseBtn  = document.getElementById('modalCloseBtn');
  const $modalCancelBtn = document.getElementById('modalCancelBtn');

  /* ── API helpers ─────────────────────────────────────────────── */
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options });
    return res.json();
  }

  /* ── Render: Profile ─────────────────────────────────────────── */
  function initials(name) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function renderProfile() {
    const u = state.user;
    $profileAvatar.textContent = initials(u.full_name);
    $profileName.textContent   = u.full_name;
    $profileMeta.innerHTML = `
      <span>${u.institution}</span>
      <span class="dot" aria-hidden="true">·</span>
      <span>Joined ${new Date(u.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>`;

    $profileDetails.innerHTML = `
      <div class="profile-detail"><span class="profile-detail__label">Email</span><span>${u.email}</span></div>
      <div class="profile-detail"><span class="profile-detail__label">Phone</span><span>${u.phone}</span></div>
      <div class="profile-detail"><span class="profile-detail__label">Institution</span><span>${u.institution}</span></div>
      <div class="profile-detail"><span class="profile-detail__label">Blood Group</span><span>${u.blood_group}</span></div>
      <div class="profile-detail"><span class="profile-detail__label">Gender</span>
        <span>${u.gender.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span></div>`;
  }

  /* ── Render: Enrolled box ────────────────────────────────────── */
  function renderEnrolledBox() {
    const regs = state.registrations ?? [];
    if (!regs.length) {
      $enrolledBox.innerHTML = `
        <div class="enrolled-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>You haven't enrolled in any competitions yet.<br>Click <strong>+ Enroll in Competition</strong> to get started.</p>
        </div>`;
      return;
    }

    $enrolledBox.innerHTML = `
      <div class="enrolled-summary">
        <span class="enrolled-count">${regs.length}</span>
        <span class="enrolled-count-label">segment${regs.length !== 1 ? 's' : ''} enrolled</span>
      </div>
      <div class="enrolled-segments">
        ${regs.map(r => `
          <div class="enrolled-segment">
            <div class="enrolled-segment__header">
              <span class="enrolled-segment__name">${r.segment_key}</span>
              <div class="enrolled-event__lock" title="Enrollment is permanent">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            </div>
            <span class="enrolled-event__type">Registered ${new Date(r.registered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>`).join('')}
      </div>`;
  }

  /* ── Render: My Submissions ──────────────────────────────────── */
  function renderSubmissionsBox() {
    const subs = state.submissions ?? [];

    // Hide the entire card if the user has no submittable segments at all
    if (!subs.length) {
      if ($submissionsCard) $submissionsCard.style.display = 'none';
      return;
    }

    if ($submissionsCard) $submissionsCard.style.display = '';

    // Upload icon SVG (inline, reused for each item)
    const uploadIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`;
    const checkIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    const linkIcon   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

    $submissionsBox.innerHTML = subs.map(s => {
      const isProjectExpo = s.slug === 'projectexpo';

      if (s.submitted && s.detail) {
        // Already submitted — show confirmation row
        const submittedDate = new Date(s.detail.submitted_at).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', year: 'numeric',
        });
        const fileInfo = isProjectExpo
          ? `<span class="submission-meta__file">${linkIcon} Drive link submitted</span>`
          : `<span class="submission-meta__file">${uploadIcon} ${escapeHtml(s.detail.file_name)}</span>`;

        return `
          <div class="submission-item submission-item--done">
            <div class="submission-item__header">
              <span class="submission-item__name">${s.label}</span>
              <span class="submission-item__badge submission-item__badge--done">${checkIcon} Submitted</span>
            </div>
            <div class="submission-meta">
              ${fileInfo}
              <span class="submission-meta__date">on ${submittedDate}</span>
            </div>
          </div>`;
      }

      // Not yet submitted — show submit button
      const hint = isProjectExpo
        ? 'Submit your 5-minute project video (Google Drive link)'
        : 'Submit (Google Drive link)';

      return `
        <div class="submission-item">
          <div class="submission-item__header">
            <span class="submission-item__name">${s.label}</span>
            <span class="submission-item__badge">Pending</span>
          </div>
          <p class="submission-item__hint">${hint}</p>
          <a class="btn btn--sm btn--primary submission-item__btn" href="${s.page}">
            ${isProjectExpo ? `${linkIcon} Submit Video Link` : `${uploadIcon} Submit File Link`}
          </a>
        </div>`;
    }).join('');
  }

  /* ── Render: Notifications ───────────────────────────────────── */
  function renderNotifications() {
    const enrolledKeys = new Set((state.registrations ?? []).map(r => r.segment_key));

    const visible = (state.notifications ?? []).filter(n =>
      !n.segment || enrolledKeys.has(n.segment)
    );

    if (!visible.length) {
      $notifList.innerHTML = `<p class="notif-empty">No notifications at the moment. Check back closer to the event!</p>`;
      $notifBadge.style.display = 'none';
      return;
    }

    $notifBadge.textContent     = visible.length;
    $notifBadge.style.display   = 'inline-flex';
    $notifList.innerHTML = visible.map(n => `
      <div class="notif-item notif-item--${n.type || n.priority || 'info'}">
        <div class="notif-item__dot"></div>
        <div class="notif-item__body">
          <p class="notif-item__text">${n.message}</p>
          <span class="notif-item__time">${n.time ?? (n.created_at ? new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '')}</span>
        </div>
      </div>`).join('');
  }

  /* ── Notification toggle ─────────────────────────────────────── */
  let notifVisible = true;
  $notifToggleBtn.addEventListener('click', () => {
    notifVisible = !notifVisible;
    $notifList.style.display    = notifVisible ? '' : 'none';
    $notifToggleBtn.textContent = notifVisible ? 'Hide' : 'Show';
  });

  /* ── QR pass ─────────────────────────────────────────────────── */
  function buildQRPayload() {
    const u = state.user;
    const profile = { id: u.id, name: u.full_name, email: u.email };
    const segments = (state.enrollments ?? [])
      .filter(e => e.registered && e.detail)
      .map(e => {
        const d = e.detail;
        const entry = { label: e.label };
        if (d.team_name) entry.team = d.team_name;
        if (d.category)  entry.category = d.category;
        if (e.slug === 'conundrumparadox') entry.verified = d.verified ? 'Verified' : 'Not Verified';
        return entry;
      });

    const segLines = segments.map(s => {
      const parts = [s.label];
      if (s.team)     parts.push(s.team);
      if (s.category) parts.push(s.category);
      if (s.verified) parts.push(s.verified);
      return parts.join(' | ');
    });

    return [
      `ID: ${profile.id}`,
      `EMAIL: ${profile.email}`,
      `NAME: ${profile.name}`,
      '',
      'SEGMENTS:',
      ...segLines,
    ].join('\n');
  }

  function generateQR() {
    const $qrCanvas = document.getElementById('qrCanvas');
    if (!$qrCanvas) return;
    $qrCanvas.innerHTML = '';
    state.qrGenerated   = false;
    const payload = buildQRPayload();
    new QRCode($qrCanvas, {
      text:         payload,
      width:        240,
      height:       240,
      colorDark:    '#9d5cff',
      colorLight:   '#06030f',
      correctLevel: QRCode.CorrectLevel.M,
    });
    document.getElementById('qrLabel').textContent = state.user.full_name;
    state.qrGenerated = true;
  }

  /* ── Canvas helper: rounded rectangle path ─────────────────── */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y,         x + r, y);
    ctx.closePath();
  }

  /* ── Download pass as a styled PDF ──────────────────────────── */
  $downloadQrBtn.addEventListener('click', () => {
    const offscreen = document.createElement('div');
    offscreen.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
    document.body.appendChild(offscreen);
    new QRCode(offscreen, {
      text:         buildQRPayload(),
      width:        220,
      height:       220,
      colorDark:    '#000000',
      colorLight:   '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });

    setTimeout(function () {
      const qrCanvas = offscreen.querySelector('canvas');
      const qrImg    = offscreen.querySelector('img');
      if (qrCanvas) {
        drawCard(qrCanvas);
      } else if (qrImg) {
        if (qrImg.complete && qrImg.naturalWidth > 0) {
          drawCard(qrImg);
        } else {
          qrImg.onload  = function () { drawCard(qrImg); };
          qrImg.onerror = function () { document.body.removeChild(offscreen); };
        }
      } else {
        document.body.removeChild(offscreen);
      }
    }, 100);

    function drawCard(qrSource) {
      const u = state.user;
      const W = 600, H = 880;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');

      ctx.fillStyle = '#0a0d1a';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      ctx.restore();

      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0,   '#6c3bff');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1,   '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, 6);

      const cx = W / 2;
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Notre Dame Annual Science Fest 2025', cx, 132);

      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 17px Georgia, serif';
      ctx.fillText('& 35th General Knowledge Competition', cx, 158);

      ctx.save();
      ctx.strokeStyle = 'rgba(168,85,247,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(60, 175); ctx.lineTo(W - 60, 175); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = 'rgba(168,85,247,0.18)';
      const pillW = 200, pillH = 30, pillX = cx - pillW/2, pillY = 185;
      roundRect(ctx, pillX, pillY, pillW, pillH, 15);
      ctx.fill();
      ctx.fillStyle = '#c4b5fd';
      ctx.font = '600 12px "Courier New", monospace';
      ctx.letterSpacing = '3px';
      ctx.fillText('PARTICIPANT  PASS', cx, 204);
      ctx.letterSpacing = '0px';

      const qrSize = 220, qrCardPad = 16;
      const cardW = qrSize + qrCardPad * 2, cardH = qrSize + qrCardPad * 2;
      const cardX = cx - cardW / 2, cardY = 232;

      ctx.save();
      ctx.shadowColor = 'rgba(168,85,247,0.4)';
      ctx.shadowBlur  = 32;
      ctx.fillStyle   = '#ffffff';
      roundRect(ctx, cardX, cardY, cardW, cardH, 16);
      ctx.fill();
      ctx.restore();
      ctx.drawImage(qrSource, cardX + qrCardPad, cardY + qrCardPad, qrSize, qrSize);

      ctx.fillStyle   = '#ffffff';
      ctx.font        = 'bold 26px Georgia, serif';
      ctx.textAlign   = 'center';
      const nameY     = cardY + cardH + 44;
      ctx.fillText(u.full_name, cx, nameY);

      ctx.fillStyle = '#a78bfa';
      ctx.font      = '15px Georgia, serif';
      ctx.fillText(u.institution, cx, nameY + 30);

      const infoY = nameY + 68;
      const chips = [u.student_class, u.division].filter(Boolean);
      const chipH = 26, chipPad = 16, chipGap = 10;
      ctx.font = '600 12px "Courier New", monospace';
      const chipWidths = chips.map(t => ctx.measureText(t).width + chipPad * 2);
      const totalChipW = chipWidths.reduce((a, b) => a + b, 0) + (chips.length - 1) * chipGap;
      let chipX = cx - totalChipW / 2;
      chips.forEach((label, i) => {
        const cw = chipWidths[i];
        ctx.fillStyle = 'rgba(109,40,217,0.35)';
        roundRect(ctx, chipX, infoY - chipH + 6, cw, chipH, chipH / 2);
        ctx.fill();
        ctx.fillStyle = '#c4b5fd';
        ctx.textAlign = 'left';
        ctx.fillText(label, chipX + chipPad, infoY);
        chipX += cw + chipGap;
      });

      const divY = infoY + 34;
      ctx.save();
      ctx.strokeStyle = 'rgba(168,85,247,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(60, divY); ctx.lineTo(W - 60, divY); ctx.stroke();
      ctx.restore();

      ctx.fillStyle   = 'rgba(148,163,184,0.5)';
      ctx.font        = '11px "Courier New", monospace';
      ctx.textAlign   = 'center';
      ctx.fillText('Notre Dame Science Club · Notre Dame College, Dhaka', cx, divY + 22);
      ctx.fillText('ndscbd.net', cx, divY + 40);

      ctx.fillStyle = grad;
      ctx.fillRect(0, H - 6, W, 6);

      const filename = 'NDSC2026-Pass-' + u.full_name.replace(/\s+/g, '-') + '.pdf';
      const imgData  = c.toDataURL('image/jpeg', 0.92);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [150, 220] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 150, 220);
      pdf.save(filename);
      document.body.removeChild(offscreen);
    }
  });

  /* ── Enrollment Modal — redirect mode ───────────────────────── */
  function openEnrollModal() {
    $modal.style.display          = 'flex';
    document.body.style.overflow  = 'hidden';
    renderModalBody();
  }

  function closeEnrollModal() {
    $modal.style.display          = 'none';
    document.body.style.overflow  = '';
  }

  function renderModalBody() {
    const enrolledSlugs = new Set((state.registrations ?? []).map(r => r.segment_key));
    const byCategory = {};
    SEGMENTS.forEach(seg => {
      const cat = seg.desc;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(seg);
    });

    $modalBody.innerHTML = Object.entries(byCategory).map(([cat, segs]) => `
      <div class="modal-segment">
        <div class="modal-segment__header">
          <span class="modal-segment__name">${cat}</span>
        </div>
        <div class="modal-segment__events">
          ${segs.map(seg => {
            const enrolled = enrolledSlugs.has(seg.slug);
            return `
              <div class="modal-event modal-event--link ${enrolled ? 'modal-event--enrolled' : ''}">
                <div class="modal-event__info">
                  <span class="modal-event__name">${seg.key}</span>
                  ${enrolled
                    ? `<span class="modal-event__badge modal-event__badge--enrolled">Enrolled</span>`
                    : `<span class="modal-event__badge">Register →</span>`}
                </div>
                ${enrolled
                  ? ''
                  : `<a class="btn btn--sm btn--primary modal-event__action"
                        href="${seg.slug}_register.html">Register</a>`}
              </div>`;
          }).join('')}
        </div>
      </div>`).join('');
  }

  /* ── Modal wiring ────────────────────────────────────────────── */
  $enrollBtn.addEventListener('click', openEnrollModal);
  $modalCloseBtn.addEventListener('click', closeEnrollModal);
  $modalCancelBtn.addEventListener('click', closeEnrollModal);
  $modal.addEventListener('click', e => { if (e.target === $modal) closeEnrollModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $modal.style.display !== 'none') closeEnrollModal();
  });

  /* ── Edit Profile ────────────────────────────────────────────── */
  const $editProfileBtn  = document.getElementById('editProfileBtn');
  const $cancelEditBtn   = document.getElementById('cancelEditBtn');
  const $saveProfileBtn  = document.getElementById('saveProfileBtn');
  const $editProfileCard = document.getElementById('editProfileCard');
  const $editProfileMsg  = document.getElementById('editProfileMsg');

  function showEditMsg(msg, type) {
    $editProfileMsg.textContent = msg;
    $editProfileMsg.style.display = 'block';
    $editProfileMsg.style.background = type === 'success' ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)';
    $editProfileMsg.style.border = type === 'success' ? '1px solid rgba(52,211,153,.3)' : '1px solid rgba(248,113,113,.28)';
    $editProfileMsg.style.color = type === 'success' ? '#6ee7b7' : '#fca5a5';
  }

  function populateEditForm(u) {
    document.getElementById('edit-name').value        = u.full_name        || '';
    document.getElementById('edit-phone').value       = u.phone            || '';
    document.getElementById('edit-institution').value = u.institution      || '';
    document.getElementById('edit-division').value    = u.division         || '';
    document.getElementById('edit-address').value     = u.address          || '';
    document.getElementById('edit-current-pass').value = '';
    document.getElementById('edit-new-pass').value    = '';
    document.getElementById('edit-new-pass2').value   = '';
    if ($editProfileMsg) $editProfileMsg.style.display = 'none';
  }

  const EDIT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

  function getNextEditDate(user) {
    if (!user.last_profile_updated_at) return null;
    const last = new Date(user.last_profile_updated_at).getTime();
    const next = last + EDIT_COOLDOWN_MS;
    return Date.now() < next ? new Date(next) : null;
  }

  $editProfileBtn?.addEventListener('click', () => {
    const nextEdit = getNextEditDate(state.user);
    if (nextEdit) {
      const formatted = nextEdit.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      // Show restriction notice inline instead of opening the form
      let notice = document.getElementById('editRestrictNotice');
      if (!notice) {
        notice = document.createElement('div');
        notice.id = 'editRestrictNotice';
        notice.style.cssText = 'margin-top:12px;padding:10px 14px;border-radius:8px;font-size:.8rem;line-height:1.6;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);color:#fcd34d;';
        $editProfileBtn.parentElement.appendChild(notice);
      }
      notice.textContent = `Profile edits are limited to once per week. You can edit again on ${formatted}.`;
      notice.style.display = 'block';
      return;
    }
    // Hide any prior restriction notice
    const notice = document.getElementById('editRestrictNotice');
    if (notice) notice.style.display = 'none';
    populateEditForm(state.user);
    $editProfileCard.style.display = 'block';
    $editProfileCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  $cancelEditBtn?.addEventListener('click', () => {
    $editProfileCard.style.display = 'none';
  });

  $saveProfileBtn?.addEventListener('click', async () => {
    const payload = {};
    const name    = document.getElementById('edit-name').value.trim();
    const phone   = document.getElementById('edit-phone').value.trim();
    const inst    = document.getElementById('edit-institution').value.trim();
    const div     = document.getElementById('edit-division').value;
    const addr    = document.getElementById('edit-address').value.trim();
    const curPass = document.getElementById('edit-current-pass').value;
    const newPass = document.getElementById('edit-new-pass').value;
    const newPass2= document.getElementById('edit-new-pass2').value;

    if (name)  payload.full_name    = name;
    if (phone) payload.phone        = phone;
    if (inst)  payload.institution  = inst;
    if (div)   payload.division     = div;
    if (addr)  payload.address      = addr;

    if (newPass) {
      if (newPass !== newPass2) { showEditMsg('New passwords do not match.', 'error'); return; }
      if (!curPass) { showEditMsg('Current password is required to change password.', 'error'); return; }
      payload.current_password = curPass;
      payload.new_password     = newPass;
    }

    $saveProfileBtn.disabled = true;
    $saveProfileBtn.textContent = 'Saving…';
    const res = await apiFetch('/api/auth/update-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    $saveProfileBtn.disabled = false;
    $saveProfileBtn.textContent = 'Save Changes';

    if (res.ok) {
      state.user = res.data.user;
      renderProfile();
      showEditMsg('✓ Profile updated successfully!', 'success');
      // Close form after short delay on success
      setTimeout(() => { $editProfileCard.style.display = 'none'; }, 2000);
    } else {
      const msg = res.data?.message || 'Update failed. Please try again.';
      showEditMsg(msg, 'error');
      // If cooldown error, also close the form and show restriction notice
      if (res.data?.status === 429 || msg.includes('once per week')) {
        setTimeout(() => { $editProfileCard.style.display = 'none'; }, 3000);
      }
    }
  });

  /* ── Logout ─────────────────────────────────────────────────── */
  $logoutBtnDash.addEventListener('click', async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/index.html';
  });

  /* ── Utility ─────────────────────────────────────────────────── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Bootstrap ──────────────────────────────────────────────── */
  async function init() {
    const [dashData, notifData] = await Promise.all([
      apiFetch('/api/dashboard'),
      apiFetch('/api/dashboard/notifications'),
    ]);

    $loading.style.display = 'none';

    if (!dashData.ok) {
      $authError.style.display = 'flex';
      return;
    }

    state.user          = dashData.data.user;
    state.enrollments   = dashData.data.enrollments ?? [];
    state.submissions   = dashData.data.submissions  ?? [];
    state.registrations = state.enrollments
      .filter(e => e.registered)
      .map(e => ({
        segment_key:   e.slug,
        registered_at: (e.detail && e.detail.registered_at) ? e.detail.registered_at : new Date().toISOString(),
      }));
    state.notifications = notifData.ok ? (notifData.data.notifications ?? []) : [];

    $content.style.display = 'block';

    renderProfile();
    renderEnrolledBox();
    renderSubmissionsBox();
    renderNotifications();
    generateQR();
  }

  document.addEventListener('DOMContentLoaded', init);

})();