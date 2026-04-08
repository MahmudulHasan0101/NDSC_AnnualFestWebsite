-- ─────────────────────────────────────────────────────────────────────────────
-- NDSC Annual Fest 2026 — Events seed data
-- Generated from segments.js — every active event name matches exactly.
-- Paste into phpMyAdmin → SQL tab and run.
-- ─────────────────────────────────────────────────────────────────────────────

-- Safe to re-run: clears existing rows first
TRUNCATE TABLE events;

INSERT INTO events (name, description, type) VALUES

-- ── Project Expo ─────────────────────────────────────────────────────────────
('Jagadish Chandra Bose (Biology/Chemistry)',
 'Project exhibition for Biology and Chemistry. Showcase original projects tackling real-world issues in the life sciences, judged on scientific depth, innovation, and presentation quality.',
 'Project Expo'),

('Jamal Nazrul Islam (Physics)',
 'Project exhibition for Physics. Present hands-on physics projects bridging theory and practical application, evaluated on scientific accuracy, problem-solving approach, and communication.',
 'Project Expo'),

('Nikola Tesla (ICT)',
 'Project exhibition for ICT. Demonstrate technology and computing projects, judged on innovation, technical execution, real-world applicability, and clarity of presentation.',
 'Project Expo'),

-- ── Art & Design ─────────────────────────────────────────────────────────────
('Wall Magazine',
 'Design and produce a wall magazine. Open to school and college students. Judged on layout, content quality, creativity, and visual appeal.',
 'Art & Design'),

('Digital Poster Designing',
 'Create a digitally designed poster on a given theme using graphic design tools. Evaluated on aesthetics, originality, and effective communication of the concept.',
 'Art & Design'),

('Scrapbook',
 'Craft a scrapbook around a science-themed topic, combining text, imagery, and mixed media. Judged on creativity, cohesion, and artistic execution.',
 'Art & Design'),

('Conceptual Art',
 'Express scientific or philosophical ideas through visual artwork in an open format. Judged on concept depth, originality, and artistic quality.',
 'Art & Design'),

('Videography (offline)',
 'Submit a short science-themed video production. Judged on storytelling, cinematography, editing quality, and scientific relevance.',
 'Art & Design'),

-- ── Scholar Hunt ─────────────────────────────────────────────────────────────
('Fr Timm Memorial Science Olympiad',
 'A comprehensive science olympiad held in memory of Fr Timm. Tests participants across multiple scientific disciplines through rigorous written examination.',
 'Scholar Hunt'),

('Sci-Fi Story Writing',
 'Write a short science fiction story grounded in real scientific concepts. Judged on scientific plausibility, creativity, and narrative quality.',
 'Scholar Hunt'),

('Sci-Nime Quiz',
 'A quiz combining science and anime/pop-culture knowledge. Rapid-fire questions in a competitive elimination format.',
 'Scholar Hunt'),

('Extempore Speech',
 'Deliver an impromptu speech on a randomly assigned science-related topic. Judged on clarity, scientific accuracy, confidence, and delivery within the allotted time.',
 'Scholar Hunt'),

-- ── Seconds to Beat ──────────────────────────────────────────────────────────
("Rubik's Cube Solving (3x3x3)",
 "Head-to-head speed-solving competition for the 3×3×3 Rubik's Cube. Challenges the most accomplished cube solvers. Fastest solve wins.",
 'Seconds to Beat'),

-- ── Conundrum Paradox ────────────────────────────────────────────────────────
('Conundrum Paradox',
 'A team-based adventure event open to all groups — Science, Business Studies, and Humanities. Teams hunt for hidden clues and solve challenges. No group barrier applies.',
 'Conundrum Paradox'),

-- ── Tech Con ─────────────────────────────────────────────────────────────────
('Robo Soccer',
 'Program robots to compete in a soccer match. Assessed on robot design, control precision, and competitive performance.',
 'Tech Con'),

('Line Following Robot',
 'Build and program autonomous robots to follow a designated line course as accurately and quickly as possible. Judged on speed and path accuracy.',
 'Tech Con'),

('Google It',
 "Fast-paced challenge testing participants' ability to efficiently search, find, and verify information online. Assesses research skills, speed, and digital literacy.",
 'Tech Con'),

-- ── Public Event ─────────────────────────────────────────────────────────────
('Public Quiz',
 'An open quiz competition accessible to all festival attendees. Tests general science knowledge in a fun, engaging format across multiple rounds.',
 'Public Event'),

-- ── 35th GKC ─────────────────────────────────────────────────────────────────
('Team Based Quiz',
 'Teams collaborate to answer general knowledge questions in a structured competitive format, progressing through elimination rounds.',
 '35th GKC'),

('Solo Quiz',
 'Individual general knowledge quiz spanning science, history, current affairs, and more. Tests breadth of knowledge and quick recall.',
 '35th GKC'),

('Old School Quiz',
 'Classic general knowledge quiz format. Questions span timeless topics with a traditional competitive quiz structure.',
 '35th GKC'),

-- ── Mystery Event ─────────────────────────────────────────────────────────────
('Mystery Event',
 'Details to be revealed at the Notre Dame Annual Science Festival 2026. Stay tuned!',
 'Mystery Event');