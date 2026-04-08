/* =================================================================
   ABOUT PAGE JS — Data + Renderer + Wavy Notebook Lines
   ================================================================= */
(function () {
  'use strict';

  /* ── DATA ──────────────────────────────────────────────────────── */
  const ABOUT = {
    paras: [
      'The Notre Dame Science Club Annual Fest is the flagship event of the Notre Dame Science Club — one of the most active student science organizations in Dhaka. Since its inception, the fest has served as a platform for students to demonstrate scientific aptitude, collaborate across disciplines, and push the limits of academic inquiry.',
      'The 2026 edition brings together exceptional young scientific minds from institutions across Dhaka and beyond. Participants compete in physics, chemistry, biology, mathematics, and computer science under the same roof, in a single day of organized, high-caliber competition.',
      'The event is organized entirely by student volunteers under faculty supervision, adhering to the highest standards of academic integrity and fair competition. All events are judged by qualified faculty members and invited professionals from related fields.',
    ],
    stats: [
      { num: '500+', label: 'Expected Participants' },
      { num: '14',   label: 'Sub-Events'            },
      { num: '3',    label: 'Main Segments'         },
      { num: '1 Day', label: 'June 14, 2026'        },
    ],
    timeline: [
      {
        time: '8:00 AM',
        title: 'Registration and Accreditation',
        desc: 'Participant check-in, badge collection, and orientation briefing at the main gate.',
      },
      {
        time: '9:00 AM',
        title: 'Opening Ceremony',
        desc: 'Inaugural address by the Principal, Chief Guest address, and cultural program in the auditorium.',
      },
      {
        time: '10:00 AM',
        title: 'Session I — Events Begin',
        desc: 'Physics Olympiad, Biology Olympiad, Programming Contest, Mathematics Olympiad, Poster Presentations, and Model Making.',
      },
      {
        time: '1:00 PM',
        title: 'Lunch Break',
        desc: 'One-hour recess. Refreshments provided for all registered participants.',
      },
      {
        time: '2:00 PM',
        title: 'Session II — Events Resume',
        desc: 'Chemistry Lab Challenge, Microscopy Challenge, Project Showcase, Robotics Challenge, Grand Science Quiz, and Debate.',
      },
      {
        time: '5:30 PM',
        title: 'Closing Ceremony and Awards',
        desc: 'Prize distribution, certificate presentation, and closing remarks by the Club President and Faculty Advisor.',
      },
    ],
  };

  /* ── RENDERERS ──────────────────────────────────────────────────── */
  function renderStats(stats) {
    return stats.map((s, i) => `
      <div class="stat-card" data-reveal="scale" data-delay="${i + 1}">
        <div class="stat-card__num">${s.num}</div>
        <div class="stat-card__label">${s.label}</div>
      </div>`).join('');
  }

  function renderTimeline(items) {
    return items.map((item, i) => `
      <div class="timeline__item" data-reveal="left" data-delay="${i + 1}">
        <div class="timeline__time">${item.time}</div>
        <div class="timeline__title">${item.title}</div>
        <div class="timeline__desc">${item.desc}</div>
      </div>`).join('');
  }

  function renderParas(paras) {
    return paras.map(p => `<p>${p}</p>`).join('');
  }

  /* ── WAVY NOTEBOOK LINES ────────────────────────────────────────
     Draws gently undulating horizontal lines across the full page,
     like a well-worn notebook held up to violet light.
  ──────────────────────────────────────────────────────────────── */
  function initWavyLines() {
    // Create canvas and inject before the nav
    const canvas = document.createElement('canvas');
    canvas.id = 'aboutLineCanvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');

    // Each "line" has its own sine wave parameters for organic variety
    let lines = [];
    let animFrame;
    let time = 0;

    function buildLines(h) {
      lines = [];
      const spacing = 34;       // gap between ruled lines (px)
      const startY  = spacing;

      for (let y = startY; y < h + spacing; y += spacing) {
        lines.push({
          baseY:     y,
          // Each line gets a unique phase, amplitude, and speed — no two wave the same way
          phase:     Math.random() * Math.PI * 2,
          amp:       1.2 + Math.random() * 2.6,   // very subtle wave height
          freq:      0.0008 + Math.random() * 0.0012,
          speed:     0.00018 + Math.random() * 0.00022,
          // Alternate between the faint accent hue and an even fainter indigo tint
          hue:       Math.random() < 0.72 ? 'violet' : 'indigo',
          opacity:   0.028 + Math.random() * 0.032,
        });
      }
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = document.body.scrollHeight;
      buildLines(canvas.height);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const ln of lines) {
        ctx.beginPath();

        const step = 4; // pixel step along x — lower = smoother curve
        for (let x = 0; x <= canvas.width; x += step) {
          // Combine two sine waves for a more natural, slightly irregular look
          const y = ln.baseY
            + Math.sin(x * ln.freq + time * ln.speed * 60 + ln.phase) * ln.amp
            + Math.sin(x * ln.freq * 1.7 + time * ln.speed * 40 + ln.phase * 0.6) * (ln.amp * 0.4);

          if (x === 0) ctx.moveTo(x, y);
          else         ctx.lineTo(x, y);
        }

        // Colour: the design uses --accent (#9d5cff) and --indigo (#6366f1)
        ctx.strokeStyle = ln.hue === 'violet'
          ? `rgba(157, 92, 255, ${ln.opacity})`
          : `rgba(99, 102, 241, ${ln.opacity * 0.85})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      time++;
      animFrame = requestAnimationFrame(draw);
    }

    // Debounced resize — also recalculates canvas height for long pages
    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(animFrame);
        resize();
        draw();
      }, 180);
    }

    window.addEventListener('resize', onResize);

    // Also watch for DOM height changes (accordion open, etc.)
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(onResize).observe(document.body);
    }

    resize();
    draw();
  }

  /* ── INIT ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    const aboutText = document.querySelector('.about-text');
  //  if (aboutText) aboutText.innerHTML = renderParas(ABOUT.paras);

    const statsGrid = document.querySelector('.stats-grid');
   // if (statsGrid) statsGrid.innerHTML = renderStats(ABOUT.stats);

    const timeline = document.querySelector('.timeline');
  //  if (timeline) timeline.innerHTML = renderTimeline(ABOUT.timeline);

    // Boot the wavy line background
    initWavyLines();
  });

})();
