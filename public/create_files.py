"""
generate_segment_pages.py
Generates registration HTML pages for all NDSC Fest 2025 segments.
Run: python generate_segment_pages.py
Output files are placed in ./output/ (created automatically).
"""

import os

SEGMENTS = [
    {
        "id": "projectexpo",
        "title": "Project Expo",
        "eyebrow": "Segment Registration",
        "desc": "Showcase your innovative science or engineering project. Present your work to a panel of judges and compete for top honours at the Project Exposition.",
    },
    {
        "id": "wallmagazine",
        "title": "Wall Magazine",
        "eyebrow": "Segment Registration",
        "desc": "Design and assemble a visually striking wall magazine on a scientific theme. Demonstrate creativity, layout skills, and scientific communication.",
    },
    {
        "id": "digitalposter",
        "title": "Digital Poster",
        "eyebrow": "Segment Registration",
        "desc": "Create a compelling digital poster that communicates a scientific concept with clarity and visual impact.",
    },
    {
        "id": "scrapbook",
        "title": "Scrapbook",
        "eyebrow": "Segment Registration",
        "desc": "Curate a science-themed scrapbook blending research, imagery, and artistic presentation into a cohesive narrative.",
    },
    {
        "id": "conceptualart",
        "title": "Conceptual Art",
        "eyebrow": "Segment Registration",
        "desc": "Express a scientific idea through conceptual art. Merge imagination with inquiry in this interdisciplinary creative challenge.",
    },
    {
        "id": "videography",
        "title": "Videography",
        "eyebrow": "Segment Registration",
        "desc": "Produce a short science-themed film or documentary. Entries are judged on storytelling, cinematography, and scientific content.",
    },
    {
        "id": "scienceolympiad",
        "title": "Science Olympiad",
        "eyebrow": "Segment Registration",
        "desc": "Compete in the Fr. Timm Memorial Science Olympiad — a multi-discipline challenge spanning biology, chemistry, physics, and mathematics.",
    },
    {
        "id": "scifiwriting",
        "title": "Sci-Fi Writing",
        "eyebrow": "Segment Registration",
        "desc": "Pen a short science-fiction story that weaves real scientific concepts into compelling speculative fiction.",
    },
    {
        "id": "scinimequiz",
        "title": "Sci-nime Quiz",
        "eyebrow": "Segment Registration",
        "desc": "A unique fusion of science trivia and anime knowledge. Bring your dual expertise to this one-of-a-kind quiz battle.",
    },
    {
        "id": "extempore",
        "title": "Extempore",
        "eyebrow": "Segment Registration",
        "desc": "Speak confidently and coherently on an impromptu scientific topic. This event tests quick thinking, oratory, and scientific awareness.",
    },
    {
        "id": "rubikscube",
        "title": "Rubik's Cube",
        "eyebrow": "Segment Registration",
        "desc": "Race against the clock to solve the classic 3×3 Rubik's Cube. Speed, accuracy, and composure are the keys to victory.",
    },
    {
        "id": "conundrumparadox",
        "title": "Conundrum Paradox",
        "eyebrow": "Segment Registration",
        "desc": "Unravel mind-bending puzzles, paradoxes, and logical conundrums in this cerebral problem-solving competition.",
    },
    {
        "id": "robosoccer",
        "title": "Robo Soccer",
        "eyebrow": "Segment Registration",
        "desc": "Engineer and program a robot to play soccer. Teams compete head-to-head in an arena showcasing robotics and strategic thinking.",
    },
    {
        "id": "linefollower",
        "title": "Line Follower",
        "eyebrow": "Segment Registration",
        "desc": "Build an autonomous robot that follows a track as fast and accurately as possible. Precision engineering meets real-time control.",
    },
    {
        "id": "googleit",
        "title": "Google It",
        "eyebrow": "Segment Registration",
        "desc": "Put your research and information-retrieval skills to the test. Find accurate answers to challenging questions using the web — against the clock.",
    },
    {
        "id": "webdesign",
        "title": "Web Design",
        "eyebrow": "Segment Registration",
        "desc": "Design and build a functional, visually polished website within the allotted time. Creativity, usability, and code quality all count.",
    },
    {
        "id": "publicquiz",
        "title": "Public Quiz",
        "eyebrow": "Segment Registration",
        "desc": "An open general-knowledge quiz open to all participants. Broad curiosity and quick recall will carry you far.",
    },
    {
        "id": "teamquiz",
        "title": "Team Quiz",
        "eyebrow": "Segment Registration",
        "desc": "Collaborate with your teammates to answer rapid-fire questions across science, technology, and culture.",
    },
    {
        "id": "soloquiz",
        "title": "Solo Quiz",
        "eyebrow": "Segment Registration",
        "desc": "A one-on-one knowledge showdown. Rely solely on your own breadth of knowledge to advance through the rounds.",
    },
    {
        "id": "oldschoolquiz",
        "title": "Old School Quiz",
        "eyebrow": "Segment Registration",
        "desc": "A nostalgic, classic-format quiz that covers timeless topics. No buzzers, no tech — just knowledge, paper, and pen.",
    },
]


HTML_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Register · NDSC Fest 2025 &amp; 35th GKC</title>
  <link rel="stylesheet" href="css/common.css" />
  <link rel="stylesheet" href="css/pages.css" />
  <style>
    .seg-reg {{
      padding-top: calc(var(--nav-h) + 72px);
      padding-bottom: 100px;
      min-height: 100vh;
    }}
    .seg-reg__eyebrow {{ margin-bottom: 14px; }}
    .seg-reg__title {{
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 500;
      font-style: italic;
      color: var(--text-primary);
      line-height: 1.15;
      margin-bottom: 12px;
    }}
    .seg-reg__desc {{
      font-size: .9rem;
      color: var(--text-muted);
      max-width: 520px;
      line-height: 1.8;
      margin-bottom: 48px;
    }}
    .seg-reg__card {{
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-l);
      padding: 40px 48px;
      max-width: 560px;
    }}
    @media (max-width: 600px) {{
      .seg-reg__card {{ padding: 28px 24px; }}
    }}
    .seg-reg__card-title {{
      font-family: var(--font-mono);
      font-size: .65rem;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 24px;
    }}
    .enroll-row {{
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }}
    .btn[data-loading="true"] {{ opacity: .6; pointer-events: none; }}
    .status-banner {{
      display: none;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      border-radius: var(--radius-m);
      font-size: .85rem;
      line-height: 1.5;
      margin-top: 20px;
    }}
    .status-banner--success {{
      background: rgba(52, 211, 153, .08);
      border: 1px solid rgba(52, 211, 153, .3);
      color: #6ee7b7;
    }}
    .status-banner--error {{
      background: rgba(248, 113, 113, .08);
      border: 1px solid rgba(248, 113, 113, .28);
      color: #fca5a5;
    }}
    .status-banner--info {{
      background: var(--accent-glow);
      border: 1px solid var(--border-strong);
      color: var(--accent-bright);
    }}
    .page-loading, .auth-error {{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 40vh;
      gap: 18px;
      text-align: center;
      color: var(--text-muted);
    }}
    .loading-spinner {{
      width: 28px; height: 28px;
      border: 2px solid var(--border-default);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }}
    @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
    .user-greeting {{
      font-family: var(--font-mono);
      font-size: .7rem;
      letter-spacing: .12em;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 32px;
    }}
    .user-greeting span {{ color: var(--accent-bright); }}
  </style>
</head>
<body>

  <canvas id="particleCanvas"></canvas>

  <nav class="nav" role="navigation" aria-label="Main navigation">
    <div class="nav__inner">
      <a class="nav__logo-group" href="index.html" aria-label="NDSC Fest Home">
        <div class="nav__logo-icon" aria-hidden="true">
          <img src="./assets/images/logo_d_a.png" alt="NDSC Fest Logo" width="36" height="36">
        </div>
        <div class="nav__logo">
          <span class="nav__logo-main">Notre Dame Annual Science Festival</span>
          <span class="nav__logo-sub">2025 &amp; 35th GKC</span>
        </div>
      </a>
      <div class="nav__spacer"></div>
      <div class="nav__center">
        <ul class="nav__links" role="list">
          <li><a class="nav__link" href="index.html">Home</a></li>
          <li><a class="nav__link" href="segments.html">Segments</a></li>
          <li><a class="nav__link" href="about.html">About</a></li>
          <li><a class="nav__link" href="contact.html">Contact</a></li>
        </ul>
        <a class="nav__cta" href="dashboard.html">Dashboard</a>
      </div>
      <button class="nav__hamburger" id="navHamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="nav__drawer" id="navDrawer" role="dialog" aria-label="Mobile menu">
    <a class="nav__link" href="index.html">Home</a>
    <a class="nav__link" href="segments.html">Segments</a>
    <a class="nav__link" href="about.html">About</a>
    <a class="nav__link" href="contact.html">Contact</a>
    <a class="nav__drawer-cta" href="dashboard.html">Dashboard</a>
  </div>

  <main class="page-enter">
    <section class="seg-reg">
      <div class="container">

        <div id="pageLoading" class="page-loading">
          <div class="loading-spinner"></div>
        </div>

        <div id="authError" class="auth-error" style="display:none;">
          <p>You must be logged in to register.</p>
          <a href="register.html" class="btn btn--primary">Log In / Register</a>
        </div>

        <div id="pageContent" style="display:none;">
          <p class="eyebrow seg-reg__eyebrow">{eyebrow}</p>
          <h1 class="seg-reg__title">{title}</h1>
          <p class="seg-reg__desc">{desc}</p>

          <p class="user-greeting">Registering as: <span id="userGreeting">—</span></p>

          <div class="seg-reg__card" data-reveal="up">
            <p class="seg-reg__card-title">Confirm your enrollment</p>

            <div class="enroll-row">
              <button class="btn btn--primary" id="enrollBtn">Enroll in {title}</button>
              <a class="btn btn--ghost btn--sm" href="dashboard.html">Back to Dashboard</a>
            </div>

            <div id="statusBanner" class="status-banner"></div>
          </div>
        </div>

      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__logo">NDSC <span>Science Fest</span> 2025 &amp; <span>35th GKC</span></div>
      <div class="footer__meta">Notre Dame Science Club, Dhaka &nbsp;&mdash;&nbsp; All rights reserved &copy; 2026</div>
    </div>
  </footer>

  <script src="js/common.js"></script>
  <script src="js/segmentRegister.js"></script>
  <script>
    initSegmentRegister({{ segment: '{segment_id}' }});
  </script>
</body>
</html>
"""


def generate_pages(output_dir: str = "output") -> None:
    os.makedirs(output_dir, exist_ok=True)

    for seg in SEGMENTS:
        html = HTML_TEMPLATE.format(
            title=seg["title"],
            eyebrow=seg["eyebrow"],
            desc=seg["desc"],
            segment_id=seg["id"],
        )
        filename = os.path.join(output_dir, f"{seg['id']}_register.html")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  ✓  {filename}")

    print(f"\nDone — {len(SEGMENTS)} files written to '{output_dir}/'")


if __name__ == "__main__":
    generate_pages()