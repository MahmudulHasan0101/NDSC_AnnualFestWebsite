'use strict';

const pool = require('../db');

/**
 * Register a participant for Line Follower.
 *
 * Rules:
 *  - Team name is REQUIRED.
 *  - Partner email is OPTIONAL. If omitted, solo entry is allowed.
 *  - If provided, both participants must share the same institution.
 *  - Partner is auto-enrolled with the same team name.
 *  - All inserts are wrapped in a transaction.
 *
 * Error codes:
 *   PARTNER_NOT_FOUND          — email not in users table
 *   PARTNER_SELF               — user tried to add themselves
 *   PARTNER_DIFF_INSTITUTION   — different institution
 *   PARTNER_ALREADY_REGISTERED — partner already enrolled
 *
 * @returns {{ primary: object, partner: object|null }}
 */
async function registerLineFollower(userId, userName, email, teamName, partnerEmail, _unused) {
  if (!teamName?.trim()) throw new Error('Team name is required.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Always fetch institution fresh from DB (don't trust req.user payload)
    const [primaryUsers] = await conn.execute(
      'SELECT institution FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    const userInstitution = primaryUsers[0]?.institution || '';

    const trimmedPartner = partnerEmail?.trim() || null;
    let partnerRow    = null;
    let partnerUserId = null;

    if (trimmedPartner) {
      const [partnerUsers] = await conn.execute(
        'SELECT id, full_name, email, institution FROM users WHERE email = ? LIMIT 1',
        [trimmedPartner]
      );

      if (!partnerUsers.length) {
        await conn.rollback();
        const err = new Error(`No account found for partner email: ${trimmedPartner}`);
        err.code  = 'PARTNER_NOT_FOUND';
        throw err;
      }

      const partner = partnerUsers[0];

      if (partner.id === userId) {
        await conn.rollback();
        const err = new Error('You cannot add yourself as a partner.');
        err.code  = 'PARTNER_SELF';
        throw err;
      }

      if (partner.institution.trim().toLowerCase() !== userInstitution.trim().toLowerCase()) {
        await conn.rollback();
        const err = new Error(
          `${partner.full_name} is from a different institution (${partner.institution}). ` +
          'Both participants must be from the same institution.'
        );
        err.code = 'PARTNER_DIFF_INSTITUTION';
        throw err;
      }

      const [existingPartnerReg] = await conn.execute(
        'SELECT id FROM reg_linefollower WHERE user_id = ? LIMIT 1',
        [partner.id]
      );
      if (existingPartnerReg.length) {
        await conn.rollback();
        const err = new Error(`${partner.full_name} is already registered for Line Follower.`);
        err.code  = 'PARTNER_ALREADY_REGISTERED';
        throw err;
      }

      partnerUserId = partner.id;

      await conn.execute(
        `INSERT INTO reg_linefollower
           (user_id, user_name, email, team_name, partner_email, partner_user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [partner.id, partner.full_name, partner.email, teamName.trim(), email, userId]
      );
      const [partnerRegRows] = await conn.execute(
        'SELECT * FROM reg_linefollower WHERE user_id = ? LIMIT 1',
        [partner.id]
      );
      partnerRow = partnerRegRows[0] || null;
    }

    await conn.execute(
      `INSERT INTO reg_linefollower
         (user_id, user_name, email, team_name, partner_email, partner_user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userName, email, teamName.trim(), trimmedPartner, partnerUserId]
    );
    const [primaryRows] = await conn.execute(
      'SELECT * FROM reg_linefollower WHERE user_id = ? LIMIT 1',
      [userId]
    );

    await conn.commit();
    return { primary: primaryRows[0] || null, partner: partnerRow };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getLineFollowerReg(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM reg_linefollower WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = { registerLineFollower, getLineFollowerReg };