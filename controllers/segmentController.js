/**
 * controllers/segmentController.js
 * Data-driven: adding a segment = one entry in SEGMENT_MAP.
 *
 * POST /api/segments/:segment/register
 * GET  /api/segments/:segment/status
 *
 * Handler shape:
 *   label       : string          — human-readable name used in messages
 *   register    : fn(uid, name, email, body, user) → row | { primary, partner }
 *   getByUser   : fn(uid)         → row | null
 *   validate    : fn(body)        → string | null  (optional)
 *   hasPartner  : bool            — if true, register() returns { primary, partner }
 *   hasPayment  : bool            — if true, payment fields are validated before registering
 */

'use strict';

const sq                 = require('../db/segmentQueries');
const { success, error } = require('../utils/response');

const SEGMENT_MAP = {
  projectexpo: {
    label: 'Project Expo',
    register: (u, n, e, b) =>
      sq.registerProjectExpo(u, n, e, b.hall, b.projectName, b.category, b.driveLink, b.partnerEmail || null),
    getByUser: sq.getProjectExpoReg,
    validate(b) {
      if (!b.hall)                return 'Hall selection is required.';
      if (!b.projectName?.trim()) return 'Project name is required.';
      if (!b.category)            return 'Category selection is required.';
      return null;
    },
    hasPartner: true,
  },

  wallmagazine: {
    label: 'Wall Magazine',
    register: (u, n, e, b, user) =>
      sq.registerWallMagazine(u, n, e, b.teamName, b.category, b.partnerEmail, user.institution),
    getByUser: sq.getWallMagazineReg,
    validate(b) {
      if (!b.teamName?.trim()) return 'Team name is required.';
      if (!b.category)         return 'Category selection is required.';
      return null;
    },
    hasPartner: true,
  },

  digitalposter:   { label: 'Digital Poster',   register: sq.registerDigitalPoster,   getByUser: sq.getDigitalPosterReg   },
  scrapbook: {
    label: 'Scrapbook',
    register: (u, n, e, b, user) =>
      sq.registerScrapbook(u, n, e, b.teamName, b.category, b.partnerEmail, user.institution),
    getByUser: sq.getScrapbookReg,
    validate(b) {
      if (!b.teamName?.trim()) return 'Team name is required.';
      if (!b.category)         return 'Category selection is required.';
      return null;
    },
    hasPartner: true,
  },
  conceptualart:   { label: 'Conceptual Art',   register: sq.registerConceptualArt,   getByUser: sq.getConceptualArtReg   },
  videography:     { label: 'Videography',       register: sq.registerVideography,     getByUser: sq.getVideographyReg     },
  scienceolympiad: {
    label: 'Fr Timm Memorial Science Olympiad',
    register: (u, n, e, b) => sq.registerScienceOlympiad(u, n, e, b.category),
    getByUser: sq.getScienceOlympiadReg,
    validate: (b) => b.category ? null : 'Category selection is required.',
  },
  theoramvault:    { label: 'Theorum Vault',     register: sq.registerTheorumVault,    getByUser: sq.getTheorumVaultReg     },
  scifiwriting:    { label: 'Sci-Fi Writing',    register: sq.registerSciFiWriting,    getByUser: sq.getSciFiWritingReg    },
  scinimequiz:     { label: 'Sci-Nime Quiz',     register: sq.registerSciNimeQuiz,     getByUser: sq.getSciNimeQuizReg     },
  extempore:       { label: 'Extempore',         register: sq.registerExtempore,       getByUser: sq.getExtemporeReg       },
  rubikscube:      { label: "Rubik's Cube",      register: sq.registerRubiksCube,      getByUser: sq.getRubiksCubeReg      },

  conundrumparadox: {
    label: 'Conundrum Paradox',
    register: (u, n, e, b) =>
      sq.registerConundrumParadox(u, n, e, b.teamName, b.partnerEmail || null, b),
    getByUser:    sq.getConundrumParadoxReg,
    checkExists:  sq.getConundrumParadoxRegRaw,   // ignores verified — blocks re-submission
    validate(b) {
      if (!b.teamName?.trim())            return 'Team name is required.';
      if (!b.transaction_id?.trim())      return 'bKash transaction ID is required.';
      if (!b.send_money_datetime?.trim()) return 'Payment date and time is required.';
      return null;
    },
    hasPartner: true,
    hasPayment: true,
  },

  robosoccer: {
    label: 'Robo Soccer',
    register: (u, n, e, b) =>
      sq.registerRoboSoccer(u, n, e, b.teamName, b.partnerEmail || null),
    getByUser: sq.getRoboSoccerReg,
    validate(b) {
      if (!b.teamName?.trim()) return 'Team name is required.';
      return null;
    },
    hasPartner: true,
  },
  linefollower: {
    label: 'Line Follower',
    register: (u, n, e, b) =>
      sq.registerLineFollower(u, n, e, b.teamName, b.partnerEmail || null),
    getByUser: sq.getLineFollowerReg,
    validate(b) {
      if (!b.teamName?.trim()) return 'Team name is required.';
      return null;
    },
    hasPartner: true,
  },
  googleit:     { label: 'Google It',      register: sq.registerGoogleIt,      getByUser: sq.getGoogleItReg      },
  webdesign:    { label: 'Web Design',     register: sq.registerWebDesign,     getByUser: sq.getWebDesignReg     },
  memeology:    { label: 'Meme-o-logy',   register: sq.registerMemeology,     getByUser: sq.getMemeologyReg     },
  publicquiz:   { label: 'Public Quiz',    register: sq.registerPublicQuiz,    getByUser: sq.getPublicQuizReg    },
  teamquiz: {
    label: 'Team Quiz',
    register: (u, n, e, b, user) =>
      sq.registerTeamQuiz(u, n, e, b.teamName, b.memberEmails, user.institution),
    getByUser: sq.getTeamQuizReg,
    validate(b) {
      if (!b.teamName?.trim()) return 'Team name is required.';
      if (!Array.isArray(b.memberEmails) || b.memberEmails.length !== 2)
        return 'Exactly 2 member emails are required.';
      if (b.memberEmails.some(e => !e?.trim()))
        return 'All 2 member email fields must be filled in.';
      return null;
    },
    hasCrew: true, // signals { captain, members } response shape
  },
  soloquiz:     { label: 'Solo Quiz',      register: sq.registerSoloQuiz,      getByUser: sq.getSoloQuizReg      },
  oldschoolquiz:{ label: 'Old School Quiz',register: sq.registerOldSchoolQuiz, getByUser: sq.getOldSchoolQuizReg },
};

/* ── POST /api/segments/:segment/register ───────────────────────────────────*/

async function registerSegment(req, res, next) {
  try {
    const segmentParam = req.params.segment?.toLowerCase();
    // console.log(`\n[SEGMENT REGISTER] ── ${new Date().toISOString()}`);
    // console.log(`[SEGMENT REGISTER] segment param : "${segmentParam}"`);
    // console.log(`[SEGMENT REGISTER] req.body      :`, JSON.stringify(req.body, null, 2));
    // console.log(`[SEGMENT REGISTER] req.user      :`, req.user ? `id=${req.user.id} email=${req.user.email}` : 'undefined');

    const handler = SEGMENT_MAP[segmentParam];
    if (!handler) {
      // console.log(`[SEGMENT REGISTER] ✗ Unknown segment: "${segmentParam}"`);
      return error(res, 'Unknown segment.', 404);
    }

    // Segment-specific field validation (includes payment checks for CP)
    if (handler.validate) {
      const validationErr = handler.validate(req.body);
      // console.log(`[SEGMENT REGISTER] validate() result:`, validationErr ?? '✓ passed');
      if (validationErr) return error(res, validationErr, 400);
    }

    const { id: uid, full_name: name, email } = req.user;

    const existsFn = handler.checkExists ?? handler.getByUser;
    if (await existsFn(uid)) {
      return error(res, `Already registered for ${handler.label}.`, 409);
    }

    let row;
    try {
      row = await handler.register(uid, name, email, req.body, req.user);
    } catch (regErr) {
      if (regErr.code === 'PARTNER_NOT_FOUND')          return error(res, regErr.message, 422);
      if (regErr.code === 'PARTNER_DIFF_INSTITUTION')   return error(res, regErr.message, 422);
      if (regErr.code === 'PARTNER_ALREADY_REGISTERED') return error(res, regErr.message, 409);
      if (regErr.code === 'PARTNER_SELF')               return error(res, regErr.message, 400);
      if (regErr.code === 'MEMBER_NOT_FOUND')           return error(res, regErr.message, 422);
      if (regErr.code === 'MEMBER_ALREADY_REGISTERED')  return error(res, regErr.message, 409);
      if (regErr.code === 'MEMBER_SELF')                return error(res, regErr.message, 400);
      if (regErr.code === 'MEMBER_DUPLICATE')           return error(res, regErr.message, 400);
      if (regErr.code === 'MEMBER_DIFF_INSTITUTION')    return error(res, regErr.message, 422);
      throw regErr;
    }

    if (handler.hasCrew) {
      if (!row?.captain) return error(res, `Already registered for ${handler.label}.`, 409);
      return success(
        res,
        { registration: row.captain, memberRegistrations: row.members },
        `Successfully registered for ${handler.label}. All 3 team members (including you) have been enrolled automatically.`,
        201
      );
    }

    if (handler.hasPartner) {
      if (!row?.primary) return error(res, `Already registered for ${handler.label}.`, 409);
      return success(
        res,
        { registration: row.primary, partnerRegistration: row.partner },
        `Successfully registered for ${handler.label}. Your partner has also been enrolled automatically.`,
        201
      );
    }

    if (!row) return error(res, `Already registered for ${handler.label}.`, 409);
    return success(res, { registration: row }, `Successfully registered for ${handler.label}.`, 201);

  } catch (err) {
    next(err);
  }
}

/* ── GET /api/segments/:segment/status ──────────────────────────────────────*/

async function getSegmentStatus(req, res, next) {
  try {
    const handler = SEGMENT_MAP[req.params.segment?.toLowerCase()];
    if (!handler) return error(res, 'Unknown segment.', 404);

    const row = await handler.getByUser(req.user.id);
    return success(res, { registered: !!row, registration: row || null });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerSegment, getSegmentStatus };