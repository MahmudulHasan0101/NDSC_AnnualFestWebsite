'use strict';

const pool = require('./db');

/* ── Re-exports from split segment files ─────────────────────────────────────*/

const { registerProjectExpo,      getProjectExpoReg      } = require('./segments/projectExpo');
const { registerWallMagazine,     getWallMagazineReg     } = require('./segments/wallMagazine');
const { registerScrapbook,        getScrapbookReg        } = require('./segments/scrapbook');
const { registerConundrumParadox, getConundrumParadoxReg,
        getConundrumParadoxRegRaw                         } = require('./segments/conundrumParadox');
const { registerTeamQuiz,         getTeamQuizReg         } = require('./segments/teamQuiz');
const { registerRoboSoccer,       getRoboSoccerReg       } = require('./segments/roboSoccer');
const { registerLineFollower,     getLineFollowerReg     } = require('./segments/lineFollower');

/* ── Generic helpers ─────────────────────────────────────────────────────────*/

async function _insert(table, fields) {
  const cols         = Object.keys(fields);
  const values       = Object.values(fields);
  const placeholders = cols.map(() => '?').join(', ');

  try {
    const [result] = await pool.execute(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
      values
    );
    const [rows] = await pool.execute(
      `SELECT * FROM ${table} WHERE id = ?`,
      [result.insertId]
    );
    return rows[0] || null;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return null;
    throw err;
  }
}

async function _getByUser(table, userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM ${table} WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

/* ── Science Olympiad ────────────────────────────────────────────────────────*/

const VALID_SO_CATEGORIES = ['Primary 5-6', 'Junior 7-8', 'Secondary 9-10', 'Higher Secondary 11-12'];

async function registerScienceOlympiad(userId, userName, email, category) {
  if (!VALID_SO_CATEGORIES.includes(category)) throw new Error('Invalid category selection.');
  return _insert('reg_scienceolympiad', { user_id: userId, user_name: userName, email, category });
}
async function getScienceOlympiadReg(userId) { return _getByUser('reg_scienceolympiad', userId); }

/* ── Simple single-registrant segments ──────────────────────────────────────*/

async function registerDigitalPoster(userId, userName, email)  { return _insert('reg_digitalposter',  { user_id: userId, user_name: userName, email }); }
async function getDigitalPosterReg(userId)                     { return _getByUser('reg_digitalposter',  userId); }

async function registerTheorumVault(userId, userName, email)   { return _insert('reg_theoramvault',   { user_id: userId, user_name: userName, email }); }
async function getTheorumVaultReg(userId)                      { return _getByUser('reg_theoramvault',   userId); }

async function registerConceptualArt(userId, userName, email)  { return _insert('reg_conceptualart',  { user_id: userId, user_name: userName, email }); }
async function getConceptualArtReg(userId)                     { return _getByUser('reg_conceptualart',  userId); }

async function registerVideography(userId, userName, email)    { return _insert('reg_videography',    { user_id: userId, user_name: userName, email }); }
async function getVideographyReg(userId)                       { return _getByUser('reg_videography',    userId); }

async function registerSciFiWriting(userId, userName, email)   { return _insert('reg_scifiwriting',   { user_id: userId, user_name: userName, email }); }
async function getSciFiWritingReg(userId)                      { return _getByUser('reg_scifiwriting',   userId); }

async function registerSciNimeQuiz(userId, userName, email)    { return _insert('reg_scinimequiz',    { user_id: userId, user_name: userName, email }); }
async function getSciNimeQuizReg(userId)                       { return _getByUser('reg_scinimequiz',    userId); }

async function registerExtempore(userId, userName, email)      { return _insert('reg_extempore',      { user_id: userId, user_name: userName, email }); }
async function getExtemporeReg(userId)                         { return _getByUser('reg_extempore',      userId); }

async function registerRubiksCube(userId, userName, email)     { return _insert('reg_rubikscube',     { user_id: userId, user_name: userName, email }); }
async function getRubiksCubeReg(userId)                        { return _getByUser('reg_rubikscube',     userId); }

async function registerGoogleIt(userId, userName, email)       { return _insert('reg_googleit',       { user_id: userId, user_name: userName, email }); }
async function getGoogleItReg(userId)                          { return _getByUser('reg_googleit',       userId); }

async function registerWebDesign(userId, userName, email)      { return _insert('reg_webdesign',      { user_id: userId, user_name: userName, email }); }
async function registerMemeology(userId, userName, email)      { return _insert('reg_memeology',      { user_id: userId, user_name: userName, email }); }
async function getWebDesignReg(userId)                         { return _getByUser('reg_webdesign',      userId); }
async function getMemeologyReg(userId)                         { return _getByUser('reg_memeology',      userId); }

async function registerPublicQuiz(userId, userName, email)     { return _insert('reg_publicquiz',     { user_id: userId, user_name: userName, email }); }
async function getPublicQuizReg(userId)                        { return _getByUser('reg_publicquiz',     userId); }

async function registerSoloQuiz(userId, userName, email)       { return _insert('reg_soloquiz',       { user_id: userId, user_name: userName, email }); }
async function getSoloQuizReg(userId)                          { return _getByUser('reg_soloquiz',       userId); }

async function registerOldSchoolQuiz(userId, userName, email)  { return _insert('reg_oldschoolquiz',  { user_id: userId, user_name: userName, email }); }
async function getOldSchoolQuizReg(userId)                     { return _getByUser('reg_oldschoolquiz',  userId); }

/* ─────────────────────────────────────────────────────────────────────────── */

module.exports = {
  // Project Expo
  registerProjectExpo,
  getProjectExpoReg,
  // Wall Magazine
  registerWallMagazine,
  getWallMagazineReg,
  // Scrapbook
  registerScrapbook,
  getScrapbookReg,
  // Conundrum Paradox
  registerConundrumParadox,
  getConundrumParadoxReg,
  getConundrumParadoxRegRaw,
  // Team Quiz
  registerTeamQuiz,
  getTeamQuizReg,
  // Robo Soccer
  registerRoboSoccer,
  getRoboSoccerReg,
  // Line Follower
  registerLineFollower,
  getLineFollowerReg,
  // Science Olympiad
  registerScienceOlympiad,
  getScienceOlympiadReg,
  // Digital Poster
  registerDigitalPoster,
  getDigitalPosterReg,
  // Conceptual Art
  registerConceptualArt,
  getConceptualArtReg,
  // Videography
  registerVideography,
  getVideographyReg,
  // Sci-Fi Writing
  registerSciFiWriting,
  getSciFiWritingReg,
  // Sci-Nime Quiz
  registerSciNimeQuiz,
  getSciNimeQuizReg,
  // Extempore
  registerExtempore,
  getExtemporeReg,
  // Rubik's Cube
  registerRubiksCube,
  getRubiksCubeReg,
  // Google It
  registerGoogleIt,
  getGoogleItReg,
  // Web Design
  registerWebDesign,
  registerMemeology,
  getWebDesignReg,
  getMemeologyReg,
  // Public Quiz
  registerPublicQuiz,
  getPublicQuizReg,
  // Solo Quiz
  registerSoloQuiz,
  getSoloQuizReg,
  // Old School Quiz
  registerOldSchoolQuiz,
  getOldSchoolQuizReg,
  // Theorum Vault
  registerTheorumVault,
  getTheorumVaultReg,
};// Added by update
