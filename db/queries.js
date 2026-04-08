/**
 * db/queries.js
 * ──────────────────────────────────────────────────────────────────────────────
 * All database operations in one place, using the mysql2 pool.
 * Controllers call these functions — they never touch the pool directly.
 */

'use strict';

const pool = require('./db');

/* ── Users ─────────────────────────────────────────────────────────────────── */

async function createUser({ full_name, email, phone, institution, division, student_class, address, blood_group, gender, password_hash, cr_dr_ref_code, club_ref_code }) {
  const [result] = await pool.execute(
    `INSERT INTO users (full_name, email, phone, institution, division, student_class, address, blood_group, gender, password_hash, cr_dr_ref_code, club_ref_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      full_name,
      email.toLowerCase().trim(),
      phone,
      institution,
      division || null,
      student_class || null,
      address || null,
      blood_group,
      gender,
      password_hash,
      cr_dr_ref_code || null,
      club_ref_code || null,
    ]
  );
  return findUserById(result.insertId);
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, phone, institution, division, student_class, address, blood_group, gender, password_hash, cr_dr_ref_code, club_ref_code, created_at
     FROM users WHERE email = ? LIMIT 1`,
    [email.trim().toLowerCase()]
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, phone, institution, division, student_class, address, blood_group, gender, cr_dr_ref_code, club_ref_code, created_at, last_profile_updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/* ── CR / DR ───────────────────────────────────────────────────────────────── */

/**
 * Look up a CR/DR row by reference code (case-insensitive).
 * Returns the row or null if not found.
 */
async function findCrDrByCode(refCode) {
  const [rows] = await pool.execute(
    `SELECT id, name, reference_code, contribution
     FROM cr_dr WHERE LOWER(reference_code) = LOWER(?) LIMIT 1`,
    [refCode.trim()]
  );
  return rows[0] || null;
}

/**
 * Increment contribution count for a CR/DR by their id.
 */
async function incrementCrDrContribution(crDrId) {
  await pool.execute(
    `UPDATE cr_dr SET contribution = contribution + 1 WHERE id = ?`,
    [crDrId]
  );
}

/* ── Club reference ─────────────────────────────────────────────────────────── */

/**
 * Look up a club row by reference code (exact numeric match).
 * Returns the row or null if not found.
 */
async function findClubByCode(refCode) {
  const [rows] = await pool.execute(
    `SELECT id, name, reference_code, contribution
     FROM club WHERE reference_code = ? LIMIT 1`,
    [refCode.trim()]
  );
  return rows[0] || null;
}

/**
 * Increment contribution count for a club by its id.
 */
async function incrementClubContribution(clubId) {
  await pool.execute(
    `UPDATE club SET contribution = contribution + 1 WHERE id = ?`,
    [clubId]
  );
}

/* ── Registrations ─────────────────────────────────────────────────────────── */

async function registerForEvent(userId, eventId) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)`,
      [userId, eventId]
    );
    const [rows] = await pool.execute(
      `SELECT id, user_id, event_id FROM event_registrations WHERE id = ?`,
      [result.insertId]
    );
    return rows[0] || null;
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return null;
    throw err;
  }
}

async function getUserRegistrations(userId) {
  const [rows] = await pool.execute(
    `SELECT e.id AS event_id, e.name AS event_name, e.type, e.description
     FROM event_registrations er
     JOIN events e ON e.id = er.event_id
     WHERE er.user_id = ?
     ORDER BY er.id ASC`,
    [userId]
  );
  return rows;
}

/* ── Events ────────────────────────────────────────────────────────────────── */

async function getAllEvents() {
  const [rows] = await pool.execute(
    `SELECT id, name, description, type FROM events ORDER BY name ASC`
  );
  return rows;
}

async function findEventById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, description, type FROM events WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Fetch all segment registrations for a user across every reg_* table.
 * Returns [{segment_key, registered_at}] sorted by registered_at ASC.
 */
async function getAllUserSegmentRegistrations(userId) {
  const SEGMENT_TABLES = [
    { table: 'reg_projectexpo',      key: 'Project Expo' },
    { table: 'reg_wallmagazine',     key: 'Wall Magazine' },
    { table: 'reg_digitalposter',    key: 'Digital Poster Designing' },
    { table: 'reg_scrapbook',        key: 'Scrapbook' },
    { table: 'reg_conceptualart',    key: 'Conceptual Art' },
    { table: 'reg_videography',      key: 'Videography' },
    { table: 'reg_scienceolympiad',  key: 'Fr Timm Memorial Science Olympiad' },
    { table: 'reg_scifiwriting',     key: 'Sci-Fi Story Writing' },
    { table: 'reg_scinimequiz',      key: 'Sci-Nime Quiz' },
    { table: 'reg_extempore',        key: 'Extempore Speech' },
    { table: 'reg_rubikscube',       key: "Rubik's Cube Solving" },
    { table: 'reg_conundrumparadox', key: 'Conundrum Paradox' },
    { table: 'reg_robosoccer',       key: 'Robo Soccer' },
    { table: 'reg_linefollower',     key: 'Line Following Robot' },
    { table: 'reg_googleit',         key: 'Google It' },
    { table: 'reg_webdesign',        key: 'Web Page Designing' },
    { table: 'reg_publicquiz',       key: 'Public Quiz' },
    { table: 'reg_teamquiz',         key: 'Team Based Quiz' },
    { table: 'reg_soloquiz',         key: 'Solo Quiz' },
    { table: 'reg_oldschoolquiz',    key: 'Old School Quiz' },
  ];

  const results = await Promise.all(
    SEGMENT_TABLES.map(async ({ table, key }) => {
      const [rows] = await pool.execute(
        `SELECT registered_at FROM ${table} WHERE user_id = ? LIMIT 1`,
        [userId]
      );
      if (!rows[0]) return null;
      return { segment_key: key, registered_at: rows[0].registered_at };
    })
  );

  return results
    .filter(Boolean)
    .sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at));
}

/* ── OTP tokens ────────────────────────────────────────────────────────────── */

async function createOtp(email, otpCode, purpose, expiresAt) {
  // Invalidate any existing unused OTPs for this email+purpose
  await pool.execute(
    `UPDATE otp_tokens SET used = 1 WHERE email = ? AND purpose = ? AND used = 0`,
    [email.toLowerCase(), purpose]
  );
  await pool.execute(
    `INSERT INTO otp_tokens (email, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)`,
    [email.toLowerCase(), otpCode, purpose, expiresAt]
  );
}

async function verifyOtp(email, otpCode, purpose) {
  const [rows] = await pool.execute(
    `SELECT id FROM otp_tokens
     WHERE email = ? AND otp_code = ? AND purpose = ? AND used = 0 AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [email.toLowerCase(), otpCode, purpose]
  );
  if (!rows[0]) return false;
  await pool.execute(`UPDATE otp_tokens SET used = 1 WHERE id = ?`, [rows[0].id]);
  return true;
}

/* ── User update ───────────────────────────────────────────────────────────── */

async function updateUser(id, fields) {
  const allowed = ['full_name', 'phone', 'institution', 'division', 'student_class', 'address', 'blood_group', 'gender', 'password_hash'];
  const setClauses = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (!setClauses.length) return findUserById(id);
  setClauses.push('last_profile_updated_at = NOW()');
  values.push(id);
  await pool.execute(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`, values);
  return findUserById(id);
}

async function updateUserPasswordByEmail(email, passwordHash) {
  await pool.execute(`UPDATE users SET password_hash = ? WHERE email = ?`, [passwordHash, email.toLowerCase()]);
}

/* ── Dev Visit Tracking ─────────────────────────────────────────────────────── */

/**
 * Record a visit to the developers page.
 * If user has visited before, increment visit_count.
 * Otherwise, create a new record with visit_count = 1.
 */
async function recordDevVisit(userId) {
  await pool.execute(
    `INSERT INTO dev_visit (user_id, visit_count)
     VALUES (?, 1)
     ON DUPLICATE KEY UPDATE visit_count = visit_count + 1`,
    [userId]
  );
}

/**
 * Get visit stats for a user.
 * Returns { visit_count, first_visit, last_visit } or null if never visited.
 */
async function getDevVisitStats(userId) {
  const [rows] = await pool.execute(
    `SELECT visit_count, first_visit, last_visit
     FROM dev_visit WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findCrDrByCode,
  incrementCrDrContribution,
  findClubByCode,
  incrementClubContribution,
  registerForEvent,
  getUserRegistrations,
  getAllEvents,
  findEventById,
  getAllUserSegmentRegistrations,
  createOtp,
  verifyOtp,
  updateUser,
  updateUserPasswordByEmail,
  recordDevVisit,
  getDevVisitStats,
};