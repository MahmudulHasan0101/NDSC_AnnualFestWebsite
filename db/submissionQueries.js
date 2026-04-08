/**
 * db/submissionQueries.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Database operations for the three online-submission segments.
 * All three accept a Google Drive link — no file uploads.
 */

'use strict';

const pool = require('./db');

const DRIVE_LINK_RE = /^https:\/\/(drive\.google\.com|docs\.google\.com)\//i;

function validateDriveLink(link) {
  if (!link || typeof link !== 'string') return 'A Google Drive link is required.';
  if (!DRIVE_LINK_RE.test(link.trim()))  return 'Please provide a valid Google Drive URL.';
  return null;
}

async function _get(table, userId) {
  const [rows] = await pool.execute(
    `SELECT * FROM ${table} WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}



/* ── Digital Poster ──────────────────────────────────────────────────────────*/

async function submitDigitalPoster(userId, driveLink) {
  const linkErr = validateDriveLink(driveLink);
  if (linkErr) { const e = new Error(linkErr); e.code = 'INVALID_LINK'; throw e; }

  const [regRows] = await pool.execute(
    `SELECT user_name, email FROM reg_digitalposter WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  const reg = regRows[0];
  if (!reg) {
    const e = new Error('You are not registered for Digital Poster Designing.');
    e.code = 'NOT_REGISTERED'; throw e;
  }

  try {
    await pool.execute(
      `INSERT INTO reg_digitalposter_submission (user_id, user_name, email, drive_link)
       VALUES (?, ?, ?, ?)`,
      [userId, reg.user_name, reg.email, driveLink.trim()]
    );
    return _get('reg_digitalposter_submission', userId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const e = new Error('You have already submitted for Digital Poster Designing.');
      e.code = 'ALREADY_SUBMITTED'; throw e;
    }
    throw err;
  }
}

async function getDigitalPosterSubmission(userId) {
  return _get('reg_digitalposter_submission', userId);
}


/* ── Theorum Vault ──────────────────────────────────────────────────────────*/

async function submitTheorumVault(userId, driveLink) {
  const linkErr = validateDriveLink(driveLink);
  if (linkErr) { const e = new Error(linkErr); e.code = 'INVALID_LINK'; throw e; }

  const [regRows] = await pool.execute(
    `SELECT user_name, email FROM reg_theoramvault WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  const reg = regRows[0];
  if (!reg) {
    const e = new Error('You are not registered for Theorum Vault.');
    e.code = 'NOT_REGISTERED'; throw e;
  }

  try {
    await pool.execute(
      `INSERT INTO reg_theoramvault_submission (user_id, user_name, email, drive_link)
       VALUES (?, ?, ?, ?)`,
      [userId, reg.user_name, reg.email, driveLink.trim()]
    );
    return _get('reg_theoramvault_submission', userId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const e = new Error('You have already submitted for Theorum Vault.');
      e.code = 'ALREADY_SUBMITTED'; throw e;
    }
    throw err;
  }
}

async function getTheorumVaultSubmission(userId) {
  return _get('reg_theoramvault_submission', userId);
}

/* ── Project Expo ────────────────────────────────────────────────────────────*/

async function submitProjectExpo(userId, driveLink) {
  const linkErr = validateDriveLink(driveLink);
  if (linkErr) { const e = new Error(linkErr); e.code = 'INVALID_LINK'; throw e; }

  const [regRows] = await pool.execute(
    `SELECT pe.user_name, pe.email, pe.project_name, pe.category,
            u.institution, u.division
     FROM reg_projectexpo pe
     JOIN users u ON u.id = pe.user_id
     WHERE pe.user_id = ? LIMIT 1`,
    [userId]
  );
  const reg = regRows[0];
  if (!reg) {
    const e = new Error('You are not registered for Project Expo.');
    e.code = 'NOT_REGISTERED'; throw e;
  }

  if (reg.division && reg.division.toLowerCase() === 'dhaka') {
    const e = new Error('Divisional submission is not available for Dhaka participants.');
    e.code = 'DHAKA_EXCLUDED'; throw e;
  }

  try {
    await pool.execute(
      `INSERT INTO reg_projectexpo_submission
         (user_id, user_name, email, institution, division, project_name, category, drive_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, reg.user_name, reg.email, reg.institution, reg.division,
       reg.project_name, reg.category, driveLink.trim()]
    );
    return _get('reg_projectexpo_submission', userId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const e = new Error('You have already submitted for Project Expo.');
      e.code = 'ALREADY_SUBMITTED'; throw e;
    }
    throw err;
  }
}

async function getProjectExpoSubmission(userId) {
  return _get('reg_projectexpo_submission', userId);
}

/* ── Videography ─────────────────────────────────────────────────────────────*/

async function submitVideography(userId, driveLink) {
  const linkErr = validateDriveLink(driveLink);
  if (linkErr) { const e = new Error(linkErr); e.code = 'INVALID_LINK'; throw e; }

  const [regRows] = await pool.execute(
    `SELECT user_name, email FROM reg_videography WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  const reg = regRows[0];
  if (!reg) {
    const e = new Error('You are not registered for Videography.');
    e.code = 'NOT_REGISTERED'; throw e;
  }

  try {
    await pool.execute(
      `INSERT INTO reg_videography_submission (user_id, user_name, email, drive_link)
       VALUES (?, ?, ?, ?)`,
      [userId, reg.user_name, reg.email, driveLink.trim()]
    );
    return _get('reg_videography_submission', userId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const e = new Error('You have already submitted for Videography.');
      e.code = 'ALREADY_SUBMITTED'; throw e;
    }
    throw err;
  }
}

async function getVideographySubmission(userId) {
  return _get('reg_videography_submission', userId);
}

/* ── Meme-o-logy ─────────────────────────────────────────────────────────── */

async function submitMemeology(userId, driveLink) {
  const linkErr = validateDriveLink(driveLink);
  if (linkErr) { const e = new Error(linkErr); e.code = 'INVALID_LINK'; throw e; }

  const [regRows] = await pool.execute(
    `SELECT user_name, email FROM reg_memeology WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  const reg = regRows[0];
  if (!reg) {
    const e = new Error('You are not registered for Meme-o-logy.');
    e.code = 'NOT_REGISTERED'; throw e;
  }

  try {
    await pool.execute(
      `INSERT INTO reg_memeology_submission (user_id, user_name, email, drive_link)
       VALUES (?, ?, ?, ?)`,
      [userId, reg.user_name, reg.email, driveLink.trim()]
    );
    return _get('reg_memeology_submission', userId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const e = new Error('You have already submitted for Meme-o-logy.');
      e.code = 'ALREADY_SUBMITTED'; throw e;
    }
    throw err;
  }
}

async function getMemeologySubmission(userId) {
  return _get('reg_memeology_submission', userId);
}

/* ── Web Page Designing ──────────────────────────────────────────────────── */

async function submitWebDesign(userId, driveLink) {
  // For web design, accept drive links OR any valid URL (for live site links)
  const link = driveLink.trim();
  if (!link || !link.startsWith('http')) {
    const e = new Error('Please enter a valid URL (Google Drive link or live site URL).');
    e.code = 'INVALID_LINK'; throw e;
  }

  const [regRows] = await pool.execute(
    `SELECT user_name, email FROM reg_webdesign WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  const reg = regRows[0];
  if (!reg) {
    const e = new Error('You are not registered for Web Page Designing.');
    e.code = 'NOT_REGISTERED'; throw e;
  }

  try {
    await pool.execute(
      `INSERT INTO reg_webdesign_submission (user_id, user_name, email, drive_link)
       VALUES (?, ?, ?, ?)`,
      [userId, reg.user_name, reg.email, link]
    );
    return _get('reg_webdesign_submission', userId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const e = new Error('You have already submitted for Web Page Designing.');
      e.code = 'ALREADY_SUBMITTED'; throw e;
    }
    throw err;
  }
}

async function getWebDesignSubmission(userId) {
  return _get('reg_webdesign_submission', userId);
}

module.exports = {
  getTheorumVaultSubmission,
  submitTheorumVault,
  submitDigitalPoster,
  getDigitalPosterSubmission,
  submitProjectExpo,
  getProjectExpoSubmission,
  submitVideography,
  submitMemeology,
  getMemeologySubmission,
  submitWebDesign,
  getWebDesignSubmission,
  getVideographySubmission,
};