/* =================================================================
   EVENTS PAGE JS — Data + Renderer + Filter
   ================================================================= */
(function () {
  'use strict';

  /* ── DEV FLAG ───────────────────────────────────────────────────── */
  /*
   * Set COMING_SOON = true  → shows the "Coming Soon" overlay
   * Set COMING_SOON = false → normal events page
   */
  const COMING_SOON = true;

  /* ── DATA ──────────────────────────────────────────────────────── */
  const FEATURED_EVENT = {
    label: 'Flagship Event',
    title: 'Grand Science Quiz',
    desc: 'The premier event of NDSC Annual Fest — an intense, multi-round buzzer quiz spanning all three scientific disciplines. Teams of two battle through qualifying rounds to a final stage judged by faculty from Notre Dame College. Open to all registered participants regardless of primary segment.',
    format: 'Team (2 members)',
    time: '2:00 PM — Main Hall',
  };

  const EVENTS = [
    // Physical Sciences
    {
      segment: 'physical',
      segmentLabel: 'Physical',
      type: 'Individual',
      title: 'Physics Olympiad',
      desc: 'Written exam covering mechanics, thermodynamics, optics, electromagnetism, and modern physics. MCQ and problem-solving format. Calculators permitted.',
      venue: 'Room 201',
      time: '10:00 AM',
      delay: 2,
    },
    {
      segment: 'physical',
      segmentLabel: 'Physical',
      type: 'Team (2)',
      title: 'Chemistry Lab Challenge',
      desc: 'Identify unknown compounds, perform titrations, and analyze chemical reactions under real laboratory conditions. Timed and assessed by practical score.',
      venue: 'Science Lab A',
      time: '10:00 AM',
      delay: 3,
    },
    {
      segment: 'physical',
      segmentLabel: 'Physical',
      type: 'Team (2)',
      title: 'Science Quiz — Physical',
      desc: 'Buzzer-format elimination quiz on physics and chemistry. Two-member teams progress from heats to a grand final. Questions span standard and olympiad level.',
      venue: 'Room 202',
      time: '10:00 AM',
      delay: 1,
    },
    {
      segment: 'physical',
      segmentLabel: 'Physical',
      type: 'Individual / Team',
      title: 'Poster Presentation — Physical',
      desc: 'Present an original research poster on a physics or chemistry topic. Judged on scientific accuracy, data clarity, and quality of visual communication.',
      venue: 'Gallery Hall',
      time: '10:00 AM',
      delay: 2,
    },
    // Life Sciences
    {
      segment: 'life',
      segmentLabel: 'Life Sciences',
      type: 'Individual',
      title: 'Biology Olympiad',
      desc: 'Written exam covering cell biology, genetics, ecology, evolution, and human physiology. Mixed MCQ and short-answer format.',
      venue: 'Room 301',
      time: '10:00 AM',
      delay: 1,
    },
    {
      segment: 'life',
      segmentLabel: 'Life Sciences',
      type: 'Team (2)',
      title: 'Microscopy Challenge',
      desc: 'Observe prepared slides and correctly identify specimens, cellular structures, and biological anomalies under time pressure. Tests practical lab skills.',
      venue: 'Bio Lab',
      time: '10:00 AM',
      delay: 2,
    },
    {
      segment: 'life',
      segmentLabel: 'Life Sciences',
      type: 'Team (2)',
      title: 'Environmental Science Debate',
      desc: 'Structured academic debate on contemporary environmental issues. Teams argue assigned positions and are scored on reasoning, evidence, and delivery.',
      venue: 'Seminar Room',
      time: '2:00 PM',
      delay: 3,
    },
    {
      segment: 'life',
      segmentLabel: 'Life Sciences',
      type: 'Team (2)',
      title: 'Science Quiz — Life',
      desc: 'Buzzer-based quiz on biology and environmental science. Questions range from fundamental concepts to recent scientific discoveries.',
      venue: 'Room 302',
      time: '2:00 PM',
      delay: 1,
    },
    {
      segment: 'life',
      segmentLabel: 'Life Sciences',
      type: 'Individual / Team',
      title: 'Model Making',
      desc: 'Build physical models representing biological structures or ecological systems using provided materials. Judged on scientific accuracy and creative execution.',
      venue: 'Workshop Room',
      time: '10:00 AM',
      delay: 2,
    },
    // Technology
    {
      segment: 'tech',
      segmentLabel: 'Technology',
      type: 'Individual',
      title: 'Programming Contest',
      desc: 'Algorithmic problem-solving competition. Participants solve a set of coding problems within a fixed time limit on a competitive programming judge platform.',
      venue: 'Computer Lab',
      time: '10:00 AM',
      delay: 1,
    },
    {
      segment: 'tech',
      segmentLabel: 'Technology',
      type: 'Individual',
      title: 'Mathematics Olympiad',
      desc: 'Written competition covering algebra, combinatorics, number theory, and geometry. Emphasis on logical reasoning and proof-based problem solving at the olympiad standard.',
      venue: 'Room 203',
      time: '10:00 AM',
      delay: 2,
    },
    {
      segment: 'tech',
      segmentLabel: 'Technology',
      type: 'Team (2–3)',
      title: 'Project Showcase',
      desc: 'Present a working prototype or applied-science project to a panel of judges from academia and industry. Evaluated on innovation, technical depth, and presentation clarity.',
      venue: 'Exhibition Hall',
      time: '2:00 PM',
      delay: 3,
    },
    {
      segment: 'tech',
      segmentLabel: 'Technology',
      type: 'Team (2–3)',
      title: 'Robotics Challenge',
      desc: 'Design, assemble, and program a robot to navigate a structured course and complete assigned tasks. Scored on task completion, speed, and engineering design quality.',
      venue: 'Tech Arena',
      time: '2:00 PM',
      delay: 1,
    },
    {
      segment: 'tech',
      segmentLabel: 'Technology',
      type: 'Individual',
      title: 'Science Fiction Writing',
      desc: 'Write an original short science fiction piece grounded in real scientific concepts. Submissions judged on scientific plausibility, narrative quality, and originality of premise.',
      venue: 'Room 101',
      time: '10:00 AM',
      delay: 2,
    },
  ];

  const SCHEDULE = [
    { time: '8:00 AM',  event: 'Registration',     loc: 'Main Gate'   },
    { time: '9:00 AM',  event: 'Opening Ceremony', loc: 'Auditorium'  },
    { time: '10:00 AM', event: 'Session I Begins',  loc: 'All Venues'  },
    { time: '1:00 PM',  event: 'Lunch Break',       loc: 'Canteen'     },
    { time: '2:00 PM',  event: 'Session II Begins', loc: 'All Venues'  },
    { time: '5:30 PM',  event: 'Closing Ceremony',  loc: 'Auditorium'  },
  ];

  /* ── RENDERERS ──────────────────────────────────────────────────── */
  function renderFeatured(ev) {
    return `
      <div class="event-featured" data-reveal="up" aria-label="Featured event">
        <div>
          <div class="event-featured__label">${ev.label}</div>
          <h2 class="event-featured__title">${ev.title}</h2>
          <p class="event-featured__desc">${ev.desc}</p>
          <div style="margin-top:24px;">
            <a class="btn btn--primary" href="register.html?event=${encodeURIComponent(ev.title)}">
              Register for this Event
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
        <div class="event-featured__aside">
          <div class="event-prize">
            <div class="event-prize__label">Top Prize</div>
            <div class="event-prize__amount">Champion</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;text-align:right;">
            <div style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);">Format</div>
            <div style="font-family:var(--font-mono);font-size:.8rem;color:var(--text-secondary);">${ev.format}</div>
            <div style="font-family:var(--font-mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-top:8px;">Time</div>
            <div style="font-family:var(--font-mono);font-size:.8rem;color:var(--text-secondary);">${ev.time}</div>
          </div>
        </div>
      </div>`;
  }

  function renderCard(ev) {
    const techClass = ev.segment === 'tech' ? ' tech' : '';
    return `
      <div class="event-card" data-segment="${ev.segment}" data-reveal="up" data-delay="${ev.delay}">
        <div class="event-card__bar"></div>
        <div class="event-card__body">
          <div class="event-card__tags">
            <span class="tag tag--segment${techClass}">${ev.segmentLabel}</span>
            <span class="tag tag--type">${ev.type}</span>
          </div>
          <h3 class="event-card__title">${ev.title}</h3>
          <p class="event-card__desc">${ev.desc}</p>
          <div class="event-card__footer">
            <div class="event-meta-row">
              <span class="event-meta-label">Venue</span>
              <span class="event-meta-value">${ev.venue}</span>
            </div>
            <div class="event-meta-row">
              <span class="event-meta-label">Time</span>
              <span class="event-meta-value">${ev.time}</span>
            </div>
            <a class="btn btn--sm btn--ghost" href="register.html?event=${encodeURIComponent(ev.title)}">Register</a>
          </div>
        </div>
      </div>`;
  }

  function renderSchedule(slots) {
    const slotsHTML = slots.map(s => `
      <div class="schedule-slot">
        <div class="schedule-slot__time">${s.time}</div>
        <div class="schedule-slot__event">${s.event}</div>
        <div class="schedule-slot__loc">${s.loc}</div>
      </div>`).join('');

    return `
      <div class="schedule-section" data-reveal="up">
        <span class="eyebrow schedule-label">Day Schedule — April 8, 2026</span>
        <div class="schedule-strip">${slotsHTML}</div>
      </div>`;
  }

  /* ── FILTER ─────────────────────────────────────────────────────── */
  function initFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.event-card:not(.event-featured)');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-segment') === filter) {
            card.removeAttribute('data-hidden');
          } else {
            card.setAttribute('data-hidden', 'true');
          }
        });
      });
    });
  }

  /* ── COMING SOON OVERLAY ─────────────────────────────────────────── */
  function mountComingSoonOverlay() {
    /* Inject keyframe + overlay styles once */
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cs-pulse {
        0%, 100% { opacity: .55; transform: scale(1);   }
        50%       { opacity: .9;  transform: scale(1.04); }
      }
      @keyframes cs-fadein {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      .cs-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(8, 8, 12, 0.92);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        padding: 24px;
        text-align: center;
      }
      .cs-overlay__glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 60% 40% at 50% 50%,
          rgba(99, 102, 241, 0.15) 0%, transparent 70%);
        pointer-events: none;
      }
      .cs-overlay__inner {
        position: relative;
        animation: cs-fadein .7s cubic-bezier(.16,1,.3,1) both;
        max-width: 480px;
        width: 100%;
      }
      .cs-overlay__icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 28px;
        animation: cs-pulse 3s ease-in-out infinite;
        color: rgba(139, 141, 255, 0.9);
      }
      .cs-overlay__eyebrow {
        font-family: var(--font-mono, monospace);
        font-size: .6rem;
        letter-spacing: .2em;
        text-transform: uppercase;
        color: rgba(139, 141, 255, 0.7);
        margin-bottom: 14px;
        display: block;
      }
      .cs-overlay__title {
        font-size: clamp(2rem, 6vw, 3.2rem);
        font-weight: 700;
        color: #fff;
        letter-spacing: -.02em;
        line-height: 1.1;
        margin: 0 0 16px;
      }
      .cs-overlay__title em {
        font-style: normal;
        background: linear-gradient(135deg, #818cf8, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .cs-overlay__sub {
        font-size: .9rem;
        color: rgba(255,255,255,.45);
        line-height: 1.7;
        margin: 0 0 36px;
      }
      .cs-overlay__rule {
        width: 40px;
        height: 1px;
        background: rgba(99,102,241,.4);
        margin: 0 auto 28px;
      }
      .cs-overlay__meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        flex-wrap: wrap;
      }
      .cs-overlay__meta-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cs-overlay__meta-label {
        font-family: var(--font-mono, monospace);
        font-size: .58rem;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: rgba(255,255,255,.3);
      }
      .cs-overlay__meta-value {
        font-size: .82rem;
        font-weight: 600;
        color: rgba(255,255,255,.7);
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'cs-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-label', 'Events coming soon');
    overlay.innerHTML = `
      <div class="cs-overlay__glow" aria-hidden="true"></div>
      <div class="cs-overlay__inner">
        <div class="cs-overlay__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <span class="cs-overlay__eyebrow">NDSC Annual Fest 2025</span>
        <h2 class="cs-overlay__title">Coming <em>Soon</em></h2>
        <p class="cs-overlay__sub">
          Event listings are being finalised.<br>
          Check back closer to the registration opening date.
        </p>
        <div class="cs-overlay__rule"></div>
        <div class="cs-overlay__meta">
          <div class="cs-overlay__meta-item">
            <span class="cs-overlay__meta-label">Event Date</span>
            <span class="cs-overlay__meta-value">April 8, 2025</span>
          </div>
          <div class="cs-overlay__meta-item">
            <span class="cs-overlay__meta-label">Venue</span>
            <span class="cs-overlay__meta-value">Notre Dame College, Dhaka</span>
          </div>
          <div class="cs-overlay__meta-item">
            <span class="cs-overlay__meta-label">Total Events</span>
            <span class="cs-overlay__meta-value">14 across 3 Segments</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    /* Prevent scrolling while overlay is shown */
    document.body.style.overflow = 'hidden';
  }

  /* ── INIT ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    if (COMING_SOON) {
      mountComingSoonOverlay();
      return; /* skip rendering event cards */
    }

    const grid = document.querySelector('.events-grid');
    if (grid) {
      grid.innerHTML = renderFeatured(FEATURED_EVENT) +
                       EVENTS.map(renderCard).join('');
    }

    const container = document.querySelector('.events-page .container');
    if (container) {
      container.insertAdjacentHTML('beforeend', renderSchedule(SCHEDULE));
    }

    initFilter();
  });

})();