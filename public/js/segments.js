/* =================================================================
   SEGMENTS PAGE JS — Data + Renderer + Accordion
   ================================================================= */
(function () {
  'use strict';

  /* ── SEGMENT ICONS ─────────────────────────────────────────────────
     Demo: using Iconify CDN SVGs — swap with your own asset paths:
       icon: './assets/icons/project-expo.svg'
     ----------------------------------------------------------------- */
  const DEMO_ICONS = [
    '../assets/Segments/project_expo.png',   // 01 Project Expo
    '../assets/Segments/art_design.png',      // 02 Art & Design
    '../assets/Segments/scholar_hunt.png',    // 03 Scholar Hunt
    '../assets/Segments/rubics.png',  // 04 Seconds to Beat
    '../assets/Segments/sci_venture.png',     // 05 Sci-Venture
    '../assets/Segments/tech_zone.png',        // 06 Tech Con
    '../assets/Segments/public_events.png',    // 07 Public Event
    '../assets/Segments/GKC.png',             // 08 35th GKC
    '../assets/Segments/mystery_event.png',   // 09 Mystery Event
  ];

  /* ── DATA ──────────────────────────────────────────────────────── */
  const SEGMENTS = [
    {
      id: 'seg-1', num: '01',
      name: "Project Expo '25", tagline: 'Project Exhibition',
      icon: DEMO_ICONS[0], open: true, featured: true,
      rounds: [
        { label: 'Deadline', name: 'Project Divisional Round', date: '1 April 2026', status: 'deadline' },
        { label: 'Round II', name: 'Grand Final', date: '16,17,18 April 2026', status: 'confirmed' },
      ],
      subsegments: [
        { title: 'Jagadish Chandra Bose', desc: 'Project exhibition category for Biology and Chemistry. Participants showcase original projects tackling real-world issues in the life sciences, judged on scientific depth, innovation, and presentation quality.', event: 'Jagadish Chandra Bose (Biology/Chemistry)', format: 'group', mode: 'offline', paid: false },
        { title: 'Jamal Nazrul Islam', desc: 'Project exhibition category for Physics. Students present hands-on physics projects that bridge theory and practical application, evaluated on scientific accuracy, problem-solving approach, and communication.', event: 'Jamal Nazrul Islam (Physics)', format: 'group', mode: 'offline', paid: false },
        { title: 'Nikola Tesla', desc: 'Project exhibition category for ICT. Participants demonstrate technology and computing projects, judged on innovation, technical execution, real-world applicability, and clarity of presentation.', event: 'Nikola Tesla (ICT)', format: 'group', mode: 'offline', paid: false },
      ],
    },
    {
      id: 'seg-2', num: '02',
      name: "Art and Design '25", tagline: 'Visual Arts · Digital Media · Creative Expression',
      icon: DEMO_ICONS[1], open: false,
      rounds: [
        { label: 'Deadline', name: 'Digital Videography & Web Designing', date: '8 April 2026', status: 'deadline' },
      ],
      subsegments: [
        { title: 'Wall Magazine', desc: `Participants shall design and produce a wall magazine. Maximum <strong style="color: white">2 participants per group</strong> can take part from the <strong style="color: white">same school/college</strong>. Judged on layout, content quality, creativity, and visual appeal.<br><br><div style="text-align: left; margin-left: 32px; font-size: 12px; color: rgba(255,255,255,0.8);"><ul style="list-style-type: disc; padding-left: 15px;"><li>Categories (as of your current class in <b>2026</b>)<br><b>Junior: 6-8</b><br><b>Secondary: 9-10</b><br><b>Higher Secondary: 11-12</b></li></ul></div>`, event: 'Wall Magazine', format: 'group', mode: 'offline', paid: false }, 
        { title: 'Digital Poster Designing', desc: 'One canvas, one theme, one shot. The theme and topic are entirely up to you — design a poster where every colour, font, and element has a purpose. Evaluated on aesthetics, originality, and effective communication of the concept.<br><br><div style="text-align: left; margin-left: 10px; font-size: 12px; color: rgba(255,255,255,0.8);"><ul style="list-style-type: disc; padding-left: 15px;"><li><strong style="color:white">Submission Process:</strong> After registering, enroll in this segment. Upload your poster to Google Drive, set sharing to <strong style="color:white">Anyone with the link can view</strong>, then submit the link via the Submission Portal on your dashboard.</li><li style="margin-top:6px;"><strong style="color:white">Submission Deadline: 8 April 2026</strong></li></ul></div>', event: 'Digital Poster Designing', format: 'solo', mode: 'online', paid: false },
        { 
  title: 'Scrapbook', 
  desc: `Participants shall craft a scrapbook on a science-themed topic, combining text, imagery, and mixed media. Maximum <strong style="color: white">2 participants per group</strong> can take part from the <strong style="color: white">same school/college</strong>. Judged on creativity, cohesion, and artistic execution.<br><br><div style="text-align: left; margin-left: 10px; font-size: 12px; color: rgba(255,255,255,0.8);"><ul style="list-style-type: disc; padding-left: 15px;"><li>Categories (as of your current class in <b>2026</b>)<br><b>Junior: 6-8</b><br><b>Secondary: 9-10</b><br><b>Higher Secondary: 11-12</b></li></ul></div>`, 
  event: 'Scrapbook', 
  format: 'group', 
  mode: 'offline', 
  paid: false 
},
{ title: 'Conceptual Art', desc: 'Express a scientific or philosophical concept through visuals that make people stop and think. A prompt will be given on the day. Colour is not required, but colour pencils may be used — fluid colours or colours requiring brushes are prohibited. Judged on concept depth, originality, and artistic quality.', event: 'Conceptual Art', format: 'solo', mode: 'offline', paid: false },
        { title: 'Videography', desc: 'Take a theme, build a narrative, and submit a short science-themed film where curiosity meets the camera. The theme and topic are entirely up to you — the result should not just inform, it should resonate. Judged on storytelling, cinematography, editing quality, and scientific relevance.<br><br><div style="text-align: left; margin-left: 10px; font-size: 12px; color: rgba(255,255,255,0.8);"><ul style="list-style-type: disc; padding-left: 15px;"><li><strong style="color:white">Submission Process:</strong> After registering, enroll in this segment. Upload your video to Google Drive, set sharing to <strong style="color:white">Anyone with the link can view</strong>, then submit the link via the Submission Portal on your dashboard.</li><li style="margin-top:6px;"><strong style="color:white">Submission Deadline: 8 April 2026</strong></li></ul></div>', event: 'Videography (offline)', format: 'solo', mode: 'online', paid: false },
        { title: 'Meme-o-logy', desc: 'Participants shall create and present original science memes on a given theme. Entries must be their own work, demonstrating creativity, scientific accuracy, clarity, and humor, and are judged on how effectively they convey the concept while engaging the audience. Submit a single Google Drive link containing your meme(s) — make sure sharing is set to <strong style="color:white">Anyone with the link can view</strong>.', event: 'Meme-o-logy', format: 'solo', mode: 'online', paid: false },
      ],
    },
    {
      id: 'seg-3', num: '03',
      name: "Scholar Hunt '25", tagline: 'Olympiad · Writing · Quiz · Speaking',
      icon: DEMO_ICONS[2], open: false,
      subsegments: [
        { 
          title: 'Fr Timm Memorial Science Olympiad', 
          desc: `A comprehensive science olympiad held in memory of Fr. Timm, spanning Physics, Mathematics, Chemistry, and Biology. Questions are mostly problem-solving type and may be one-word, descriptive, or MCQ format. A qualifying number of contestants from the first round advance to a second round (secondary and higher secondary categories only). Non-programmable scientific calculators are permitted for secondary and higher secondary categories only.<br><br><div style="text-align: left; margin-left: 10px; font-size: 12px; color: rgba(255,255,255,0.8);"><ul style="list-style-type: disc; padding-left: 15px;"><li>Categories (as of your current class in <b>2026</b>)<br><br><b>Primary: 5-6</b><br><b>Junior: 7-8</b><br><b>Secondary: 9-10</b><br><b>Higher Secondary: 11-12</b></li></ul></div>`, 
          event: 'Fr Timm Memorial Science Olympiad', 
          format: 'solo', 
          mode: 'offline', 
          paid: false 
        },
    { 
          title: 'Theorem Vault', 
          desc: `Participants must submit an original research article on a scientific topic of their choice. The research must demonstrate a reasonable amount of originality and practical utility. Maximum <strong style="color: white">2 participants per group</strong> from the <strong style="color: white">same school/college</strong>.<br><br><div style="text-align: left; margin-left: 10px; font-size: 12px; color: rgba(255,255,255,0.8);"><ul style="list-style-type: disc; padding-left: 15px;"><li><strong style="color:white">Submission Process:</strong> After registering, enroll in this segment. Upload your research paper to Google Drive, set sharing to <strong style="color:white">Anyone with the link can view</strong>, then submit the link via the Submission Portal on your dashboard.</li><li style="margin-top:6px;"><strong style="color:white">Submission Deadline: 8 April 2026</strong></li></ul></div>`,
          event: 'Theorem Vault', 
          format: 'group', 
          mode: 'online', 
          paid: false 
        },
        { title: 'Sci-Fi Story Writing', desc: 'Craft compelling, professional-quality science fiction built upon a provided short text. Explore the intersection of science and imagination — there is no word limit or form constraint, so long as the story remains relevant. Judged on scientific plausibility, creativity, and narrative quality.', event: 'Sci-Fi Story Writing', format: 'solo', mode: 'offline', paid: false },
        { title: 'Sci-Nime Quiz', desc: 'Where your binge-watching finally pays off. A Sci-Fi anime Q&amp;A that separates the fans from those who understand the science behind the screen. The quiz is based on: <strong style="color:white">Neon Genesis Evangelion (1995)</strong>, <strong style="color:white">Serial Experiments Lain (1998)</strong>, <strong style="color:white">Steins;Gate (2011)</strong>, and <strong style="color:white">Pluto (2023)</strong>. Topics are provided in advance so you can watch them before the event.', event: 'Sci-Nime Quiz', format: 'solo', mode: 'offline', paid: false },
        { title: 'Extempore Speech', desc: 'A topic is assigned on the spot. Participants receive some preparation time, but mobile phones, books, and other research aids are strictly prohibited. Speak with clarity and conviction — judged on content, scientific accuracy, confidence, and delivery.', event: 'Extempore Speech', format: 'solo', mode: 'offline', paid: false },
      ],
    },
    {
      id: 'seg-4', num: '04',
      name: "Seconds to Beat '25", tagline: "Rubik's Cube Solving",
      icon: DEMO_ICONS[3], open: false,
      subsegments: [
        { title: "Rubik's Cube Solving", desc: "43 quintillion possibilities, only one solution. Race against the clock and your rivals to solve the 3×3×3 in the fastest time possible. Every turn counts. The Rubik's cube and all required equipment will be provided.", event: "Rubik's Cube Solving (3x3x3)", format: 'solo', mode: 'offline', paid: false },
      ],
    },
    {
      id: 'seg-5', num: '05',
      name: "Sci Venture", tagline: 'Conundrum Paradox',
      icon: DEMO_ICONS[4], open: false,
      subsegments: [
        { title: 'Conundrum Paradox', desc: 
          'A 70 Years Anniversary Special Segment of the Notre Dame Annual Science Festival 2025.<br><br>\
          This event will challenge participants with intriguing puzzles, paradoxes, and logical problems designed to test creativity, critical thinking, and problem-solving skills.<br><br>\
          Registration Process:<br>\
          Send BDT 100 via bKash (Send Money) to 01875027806 and complete the registration on this portal using your payment details.<br><br>\
          Challenge your mind and be part of this unique special segment!',
          event: 'Conundrum Paradox', format: 'solo', mode: 'offline', paid: true, fee: '100tk' },
      ],
    },
    {
      id: 'seg-6', num: '06',
      name: "Tech Con '25", tagline: 'Robotics · Programming · Web Design',
      icon: DEMO_ICONS[5], open: false,
      rounds: [
        { label: 'Deadline', name: 'Web Page Designing Submission', date: '8 April 2026', status: 'deadline' },
      ],
      subsegments: [
        { title: 'Robo Soccer', desc: 'Design, program, and unleash a robot that can read the game, chase the ball, and find the back of the net. The strategy is yours; the execution is your machine\'s. Robot must follow the formula of any generic robo soccer contest. Maximum <strong style="color:white">2 participants per group</strong> from the <strong style="color:white">same school/college</strong>. Participants must bring their own robot. The club/institute will not be responsible for any damage or loss caused by your negligence.', event: 'Robo Soccer', format: 'group', mode: 'offline', paid: false },
        { title: 'Line Following Robot', desc: 'Build and program an autonomous robot to follow a designated course with surgical speed and accuracy — precision isn\'t optional, it\'s everything. Maximum <strong style="color:white">2 participants per group</strong> from the <strong style="color:white">same school/college</strong>. Participants must bring their own robot. The club/institute will not be responsible for any damage or loss unless caused by their own negligence.', event: 'Line Following Robot', format: 'group', mode: 'offline', paid: false },
        { title: 'Google It', desc: 'Put your research skills to the ultimate test — find the right answer from the right source, faster than everyone in the room. Participants must bring their own smartphone, tablet, or other device with their own internet connection. <strong style="color:white">Using AI chatbots is strictly prohibited.</strong>', event: 'Google It', format: 'solo', mode: 'offline', paid: false },
        { title: 'Web Page Designing', desc: 'Participants design and build a functional web page on a given theme. You may <strong style="color:white">submit a video demo of your website</strong>, or host your site live using GitHub Pages, Netlify, Vercel, or any other hosting service and submit the live URL. Judged on UI/UX design, code quality, responsiveness, and creativity. Submission deadline: <strong style="color:white">8 April 2026</strong>.', event: 'Web Page Designing', format: 'solo', mode: 'online', paid: false },
      ],
    },
    {
      id: 'seg-7', num: '07',
      name: 'Public Event', tagline: 'Open to All',
      icon: DEMO_ICONS[6], open: false,
      rounds: [
        { label: 'Date', name: 'Public Quiz', date: '18 April 2026', status: 'confirmed' },
      ],
      subsegments: [
        { title: 'Public Quiz', desc: 'An open quiz competition accessible to all — even visitors who haven\'t signed up for the fest. Scan a QR code found on campus to access the Google Form and answer as many questions as you can before the clock runs out. The quiz will remain active until results are announced.', event: 'Public Quiz', format: 'solo', mode: 'offline', paid: false },
      ],
    },
    {
      id: 'seg-8', num: '08',
      name: '35th GKC', tagline: 'General Knowledge Competition',
      icon: DEMO_ICONS[7], open: false,
      subsegments: [
        { title: 'Team Based Quiz', desc: 'Teams collaborate to answer a wide range of general knowledge questions in a structured competitive format, progressing through elimination rounds.', event: 'Team Based Quiz', format: 'group', mode: 'offline', paid: false },
        { title: 'Solo Quiz', desc: 'Individual participants compete in a general knowledge quiz spanning science, history, current affairs, and more. Tests breadth of knowledge and quick recall.', event: 'Solo Quiz', format: 'solo', mode: 'offline', paid: false },
        { title: 'Old School Quiz', desc: 'A nostalgic quiz format drawing on classic general knowledge traditions. Questions span timeless topics with a traditional competitive quiz structure.', event: 'Old School Quiz', format: 'solo', mode: 'offline', paid: false },
      ],
    },
    {
      id: 'seg-9', num: '09',
      name: 'Mystery Event', tagline: 'Details Coming Soon',
      icon: DEMO_ICONS[8], open: false,
      subsegments: [
        // { title: 'Mystery Event', desc: 'Perhaps something no one has every seen...', event: 'Mystery Event', format: null, mode: null, paid: false },
      ],
    },
  ];

  /* ── AUTH STATE ─────────────────────────────────────────────────── */
  let _isLoggedIn = false; // set before rendering

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        _isLoggedIn = !!(data.data?.user);
      }
    } catch { /* offline / server not running — treat as guest */ }
  }

  /* ── RENDERER ───────────────────────────────────────────────────── */
  function buildSubsegment(sub) {
    const badges = [];
    if (sub.format) {
      const isGroup = sub.format === 'group';
      badges.push(`<span class="subsegment__badge subsegment__badge--${sub.format}">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          ${isGroup
            ? '<circle cx="5" cy="4" r="2.2" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="4" r="2.2" stroke="currentColor" stroke-width="1.4"/><path d="M1 12c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
            : '<circle cx="7" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'}
        </svg>
        ${isGroup ? 'Group' : 'Solo'}
      </span>`);
    }
    if (sub.mode) {
      const isOnline = sub.mode === 'online';
      badges.push(`<span class="subsegment__badge subsegment__badge--${sub.mode}">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          ${isOnline
            ? '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M7 1.5C7 1.5 4.5 4 4.5 7s2.5 5.5 2.5 5.5M7 1.5C7 1.5 9.5 4 9.5 7S7 12.5 7 12.5M1.5 7h11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
            : '<path d="M2 4h10v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" stroke-width="1.4"/><path d="M5 11.5v1.5M9 11.5v1.5M4 13h6M7 1.5v2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'}
        </svg>
        ${isOnline ? 'Online' : 'On-site'}
      </span>`);
    }
    if (sub.paid === true) {
      badges.push(`<span class="subsegment__badge subsegment__badge--paid">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M7 4v1M7 9v1M5 6.5c0-.83.67-1.5 2-1.5s2 .67 2 1.5S8.33 8 7 8s-2 .67-2 1.5S5.67 11 7 11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        ${sub.fee ? sub.fee + ' Fee' : 'Paid'}
      </span>`);
    } else {
      badges.push(`<span class="subsegment__badge subsegment__badge--free">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4.5 7l2 2 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/>
        </svg>
        Free
      </span>`);
    }

    const badgesHTML = badges.length
      ? `<div class="subsegment__badges">${badges.join('')}</div>`
      : '';

     let prizeHTML = '';
    if (sub.title === "Conundrum Paradox") {
      prizeHTML = `
        <div class="subsegment__prize">
          <svg class="subsegment__prize-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
          <span class="subsegment__prize-text">Special Prize Money Included</span>
        </div>`;
    }
     
return `
      <div class="subsegment">
        <div class="subsegment__header">
          <div class="subsegment__dot"></div>
          <h4 class="subsegment__title">${sub.title}</h4>
        </div>
        <div class="subsegment__badges">
          ${badgesHTML}
        </div>
        ${prizeHTML}  <p class="subsegment__desc">${sub.desc}</p>
        ${_isLoggedIn
          ? `<a class="btn btn--sm btn--ghost subsegment__register"
               href="dashboard.html">
               Go to Dashboard
               <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                 <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
             </a>`
          : `<a class="btn btn--sm btn--ghost subsegment__register"
               href="register.html?event=${encodeURIComponent(sub.event)}">
               Register for this Event
               <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                 <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
             </a>`
        }
      </div>`;
  }

  function buildRoundsPanel(rounds) {
    if (!rounds || !rounds.length) return '';
    const blocksHTML = rounds.map(function (r) {
      let datePill;
      if (r.status === 'deadline') {
        datePill = `<span class="round-pill round-pill--deadline">
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 4v3.2l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Deadline &mdash; ${r.date}
        </span>`;
      } else {
        datePill = `<span class="round-pill round-pill--confirmed">
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M4.5 7l2 2 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${r.date}
        </span>`;
      }
      return `
        <div class="round-item">
          <span class="round-item__label">${r.label}</span>
          <span class="round-item__name">${r.name}</span>
          ${datePill}
        </div>`;
    }).join('');
    return `<div class="rounds-panel">${blocksHTML}</div>`;
  }

  function buildSegment(seg, index) {
    const subsHTML = seg.subsegments.map(buildSubsegment).join('');
    const iconHTML = seg.icon
      ? `<img class="segment__icon" src="${seg.icon}" alt="" aria-hidden="true" width="82" height="82">`
      : '';

    if (seg.featured) {
      return `
        <div class="expo-hero${seg.open ? ' open' : ''}" data-reveal="up" data-delay="0">

          <!-- Tilted line decoration grid -->
          <div class="expo-hero__lines" aria-hidden="true">
            <span class="expo-hero__line expo-hero__line--1"></span>
            <span class="expo-hero__line expo-hero__line--2"></span>
            <span class="expo-hero__line expo-hero__line--3"></span>
            <span class="expo-hero__line expo-hero__line--4"></span>
          </div>

          <!-- Corner accent marks -->
          <span class="expo-hero__corner expo-hero__corner--tl" aria-hidden="true"></span>
          <span class="expo-hero__corner expo-hero__corner--tr" aria-hidden="true"></span>
          <span class="expo-hero__corner expo-hero__corner--bl" aria-hidden="true"></span>
          <span class="expo-hero__corner expo-hero__corner--br" aria-hidden="true"></span>

          <!-- Top bar -->
          <div class="expo-hero__topbar">
            <span class="expo-hero__featured-badge">Featured Segment</span>
            <span class="expo-hero__num">01</span>
          </div>

          <!-- Main body -->
          <div class="expo-hero__main">
            <!-- Left: Icon + identity -->
            <div class="expo-hero__identity">
              ${iconHTML ? `<div class="expo-hero__icon-wrap">${iconHTML.replace('class="segment__icon"', 'class="expo-hero__icon"')}</div>` : ''}
              <div class="expo-hero__identity-text">
                <h2 class="expo-hero__name">${seg.name}</h2>
                <p class="expo-hero__tagline">${seg.tagline}</p>
              </div>
            </div>

            <!-- Right: Rounds timeline -->
            <div class="expo-hero__timeline">
              <div class="expo-hero__timeline-label">Competition Rounds</div>
              ${seg.rounds.map((r, i) => `
                <div class="expo-hero__round${r.status === 'confirmed' ? ' expo-hero__round--confirmed' : ''}">
                  <div class="expo-hero__round-connector" aria-hidden="true">
                    <span class="expo-hero__round-node"></span>
                    ${i < seg.rounds.length - 1 ? '<span class="expo-hero__round-line"></span>' : ''}
                  </div>
                  <div class="expo-hero__round-content">
                    <span class="expo-hero__round-label">${r.label}</span>
                    <span class="expo-hero__round-name">${r.name}</span>
                    <span class="expo-hero__round-pill expo-hero__round-pill--${r.status}">
                      ${r.status === 'deadline'
                        ? `<svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M7 4v3.2l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Deadline — ${r.date}`
                        : `<svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> ${r.date}`}
                    </span>
                  </div>
                </div>`).join('')}

              <!-- Divisional round callout -->
              <div class="expo-hero__divisional-note">
                <div class="expo-hero__divisional-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M10 2.5C10 2.5 6.5 5.5 6.5 10s3.5 7.5 3.5 7.5M10 2.5C10 2.5 13.5 5.5 13.5 10S10 17.5 10 17.5M2.5 10h15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </div>
                <div>
                  <span class="expo-hero__divisional-title">Divisional Round — Open Nationwide</span>
                  <p class="expo-hero__divisional-desc">Participants <strong>outside Dhaka city</strong> compete in the Divisional Round remotely. Submit a <strong>3-minute video</strong> presenting your project online — no travel required. Top entries advance to the Grand Final, for which you will have to be present on the campus of Notre Dame

College, Dhaka.</p>

<div style="text-align: right; opacity: 0.8; margin-left: 32px; font-size: 12px; color: white; font-family: Arial, sans-serif;">
  <ul style="list-style-type: disc; display: inline-block; text-align: left;">
    <li>
      Categories (as of your current class in <b>2026</b>)<br><br>
      <b>Junior: 6-8</b><br>
      <b>Secondary: 9-10</b><br>
      <b>Higher Secondary: 11-12</b>
    </li>
    <li style="margin-top: 10px;">
      Maximum <b>2 participants</b> are allowed per group and both must be from the<br>
      <b>same school/college.</b>
    </li>
  </ul>
</div>

                </div>
              </div>
            </div>
          </div>

          <!-- Expand toggle -->
          <button class="expo-hero__toggle segment__trigger"
                  aria-expanded="${seg.open ? 'true' : 'false'}"
                  aria-controls="${seg.id}-body">
            <span class="expo-hero__toggle-text">Explore Sub-events</span>
            <span class="expo-hero__toggle-chevron" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round">
                <path d="M6 2v8M2 6h8"/>
              </svg>
            </span>
          </button>

          <!-- Collapsible body -->
          <div class="segment__body expo-hero__body" id="${seg.id}-body">
            <div class="subsegment-grid">
              ${subsHTML}
            </div>
          </div>

        </div>
        <div class="segment-list__divider" aria-hidden="true"></div>`;
    }

    return `
      <div class="segment${seg.open ? ' open' : ''}" data-reveal="up" data-delay="${index + 1}">
        <button class="segment__trigger"
                aria-expanded="${seg.open ? 'true' : 'false'}"
                aria-controls="${seg.id}-body">
          <span class="segment__num">${seg.num}</span>
          <div class="segment__meta">
            ${iconHTML}
            <div class="segment__name">${seg.name}</div>
            <div class="segment__tagline">${seg.tagline}</div>
          </div>
          <div class="segment__chevron" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round">
              <path d="M6 2v8M2 6h8"/>
            </svg>
          </div>
        </button>
        <div class="segment__body" id="${seg.id}-body">
          <div class="subsegment-grid">
            ${subsHTML}
          </div>
        </div>
      </div>`;
  }

  /* ── ACCORDION ───────────────────────────────────────────────────── */
  function initAccordion() {
    const triggers = document.querySelectorAll('.segment__trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const segment = trigger.closest('.segment, .expo-hero');
        const isOpen  = segment.classList.contains('open');

        document.querySelectorAll('.segment.open, .expo-hero.open').forEach(function (s) {
          s.classList.remove('open');
          const t = s.querySelector('.segment__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          segment.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
          segment.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  /* ── INIT ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async function () {
    const list = document.querySelector('.segment-list');
    if (!list) return;

    await checkAuth(); // resolve login state before rendering buttons
    list.innerHTML = SEGMENTS.map(buildSegment).join('');
    initAccordion();
  });

})();