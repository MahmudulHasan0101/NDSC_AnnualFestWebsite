/**
 * controllers/dashboardController.js
 * Returns user profile + per-segment enrollment status + submission statuses.
 */

'use strict';

const db = require('../db/queries');
const sq = require('../db/segmentQueries');
const subQ = require('../db/submissionQueries');
const { success, error } = require('../utils/response');

const NOTIFICATIONS = [
  {
    id:      'global-welcome',
    segment: null,
    type:    'info',
    message: 'Welcome to Notre Dame Annual Fest 2025 & 35th GKC! The event will be held on 16–18 April 2026 at Notre Dame College, Dhaka.',
    time:    'Pinned',
  },
  {
    id:      'global-id-card',
    segment: null,
    type:    'warning',
    message: 'All participants must bring their institution ID card on the event day. Entry will be verified at the gate.',
    time:    'Pinned',
  },
    {
    id:      'global-welcome',
    segment: null,
    type:    'info',
    message: 'Scroll down and click on ENROLL IN COMPETITION to enroll in the segment you like, if the segment is online, you will automatically get a submission button down below',
    time:    'Pinned',
  }
];

// Single source of truth — slugs and pages must match SEGMENT_MAP in segmentController.js
const SEGMENTS = [
  { slug: 'projectexpo',      label: 'Project Expo',                      page: 'projectexpo_register.html',      getByUser: sq.getProjectExpoReg      },
  { slug: 'wallmagazine',     label: 'Wall Magazine',                      page: 'wallmagazine_register.html',     getByUser: sq.getWallMagazineReg     },
  { slug: 'digitalposter',    label: 'Digital Poster',                     page: 'digitalposter_register.html',    getByUser: sq.getDigitalPosterReg    },
  { slug: 'theoramvault',     label: 'Theorum Vault',                      page: 'theoramvault_register.html',     getByUser: sq.getTheorumVaultReg     },
  { slug: 'scrapbook',        label: 'Scrapbook',                          page: 'scrapbook_register.html',        getByUser: sq.getScrapbookReg        },
  { slug: 'conceptualart',    label: 'Conceptual Art',                     page: 'conceptualart_register.html',    getByUser: sq.getConceptualArtReg    },
  { slug: 'videography',      label: 'Videography',                        page: 'videography_register.html',      getByUser: sq.getVideographyReg      },
  { slug: 'scienceolympiad',  label: 'Fr Timm Memorial Science Olympiad',  page: 'scienceolympiad_register.html',  getByUser: sq.getScienceOlympiadReg  },
  { slug: 'scifiwriting',     label: 'Sci-Fi Writing',                     page: 'scifiwriting_register.html',     getByUser: sq.getSciFiWritingReg     },
  { slug: 'scinimequiz',      label: 'Sci-Nime Quiz',                      page: 'scinimequiz_register.html',      getByUser: sq.getSciNimeQuizReg      },
  { slug: 'extempore',        label: 'Extempore',                          page: 'extempore_register.html',        getByUser: sq.getExtemporeReg        },
  { slug: 'rubikscube',       label: "Rubik's Cube",                       page: 'rubikscube_register.html',       getByUser: sq.getRubiksCubeReg       },
  { slug: 'conundrumparadox', label: 'Conundrum Paradox',                  page: 'conundrumparadox_register.html', getByUser: sq.getConundrumParadoxReg },
  { slug: 'robosoccer',       label: 'Robo Soccer',                        page: 'robosoccer_register.html',       getByUser: sq.getRoboSoccerReg       },
  { slug: 'linefollower',     label: 'Line Follower',                      page: 'linefollower_register.html',     getByUser: sq.getLineFollowerReg     },
  { slug: 'googleit',         label: 'Google It',                          page: 'googleit_register.html',         getByUser: sq.getGoogleItReg         },
  { slug: 'webdesign',        label: 'Web Design',                         page: 'webdesign_register.html',        getByUser: sq.getWebDesignReg        },
  { slug: 'publicquiz',       label: 'Public Quiz',                        page: 'publicquiz_register.html',       getByUser: sq.getPublicQuizReg       },
  { slug: 'teamquiz',         label: 'Team Quiz',                          page: 'teamquiz_register.html',         getByUser: sq.getTeamQuizReg         },
  { slug: 'soloquiz',         label: 'Solo Quiz',                          page: 'soloquiz_register.html',         getByUser: sq.getSoloQuizReg         },
  { slug: 'oldschoolquiz',    label: 'Old School Quiz',                    page: 'oldschoolquiz_register.html',    getByUser: sq.getOldSchoolQuizReg    },
  { slug: 'memeology',       label: 'Meme-o-logy',                         page: 'memeology_register.html',        getByUser: sq.getMemeologyReg        },
];

// Segments that have an online submission step, keyed by slug
const SUBMITTABLE_SEGMENTS = {
  theoramvault:    { label: 'Theorum Vault',page: 'theoramvault_submit.html',  getSubmission: subQ.getTheorumVaultSubmission    },
  digitalposter: { label: 'Digital Poster', page: 'digitalposter_submit.html', getSubmission: subQ.getDigitalPosterSubmission },
  projectexpo:   { label: 'Project Expo',   page: 'projectexpo_submit.html',   getSubmission: subQ.getProjectExpoSubmission   },
  videography:   { label: 'Videography',    page: 'videography_submit.html',   getSubmission: subQ.getVideographySubmission   },
  memeology:     { label: 'Meme-o-logy',   page: 'memeology_submit.html',     getSubmission: subQ.getMemeologySubmission     },
  webdesign:     { label: 'Web Design',    page: 'webdesign_submit.html',     getSubmission: subQ.getWebDesignSubmission     },
};

exports.getDashboard = async (req, res, next) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) return error(res, 'User not found.', 404);

    // Enrollments
    const statuses = await Promise.all(SEGMENTS.map(s => s.getByUser(req.user.id)));
    const enrollments = SEGMENTS.map((s, i) => ({
      slug:       s.slug,
      label:      s.label,
      page:       s.page,
      registered: !!statuses[i],
      detail:     statuses[i] || null,
    }));

    // Build a quick lookup: which slugs is this user registered for?
    const registeredSlugs = new Set(
      enrollments.filter(e => e.registered).map(e => e.slug)
    );

    // Submissions — only fetch for segments the user is actually registered for
    const submissionEntries = await Promise.all(
      Object.entries(SUBMITTABLE_SEGMENTS).map(async ([slug, cfg]) => {
        if (!registeredSlugs.has(slug)) return null;

        // Project Expo: skip if user is from Dhaka
        if (slug === 'projectexpo' && user.division && user.division.toLowerCase() === 'dhaka') {
          return null;
        }

        const sub = await cfg.getSubmission(req.user.id);
        return {
          slug,
          label:     cfg.label,
          page:      cfg.page,
          submitted: !!sub,
          detail:    sub || null,
        };
      })
    );

    const submissions = submissionEntries.filter(Boolean);

    return success(res, { user, enrollments, submissions });
  } catch (err) {
    next(err);
  }
};

exports.getNotifications = (_req, res) => {
  res.json({ ok: true, data: { notifications: NOTIFICATIONS } });
};
