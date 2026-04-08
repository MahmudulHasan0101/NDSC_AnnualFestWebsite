'use strict';

const pool = require('../db');

/**
 * Register a captain + 2 members for Team Quiz.
 *
 * Rules:
 *  - Captain provides a team name + exactly 2 member emails.
 *  - All 2 members must have accounts (MEMBER_NOT_FOUND).
 *  - No member may be the captain themselves (MEMBER_SELF).
 *  - No member may already be registered for Team Quiz (MEMBER_ALREADY_REGISTERED).
 *  - All members must be from the same institution as the captain (MEMBER_DIFF_INSTITUTION).
 *  - Member emails must be distinct (MEMBER_DUPLICATE).
 *  - All 3 inserts (captain + 2 members) are in a single transaction.
 *
 * @returns {{ captain: object, members: [object, object, object] }}
 */
async function registerTeamQuiz(userId, userName, email, teamName, memberEmails, _unused) {
  if (!teamName?.trim())
    throw new Error('Team name is required.');
  if (!Array.isArray(memberEmails) || memberEmails.length !== 2)
    throw new Error('Exactly 2 member emails are required.');

  const trimmedMembers = memberEmails.map(e => e.trim().toLowerCase());

  // Duplicate member check
  if (new Set(trimmedMembers).size !== 2) {
    const err = new Error('All 2 member emails must be distinct.');
    err.code = 'MEMBER_DUPLICATE';
    throw err;
  }

  // Self-enrollment check
  if (trimmedMembers.includes(email.trim().toLowerCase())) {
    const err = new Error('You cannot add yourself as a team member.');
    err.code = 'MEMBER_SELF';
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Always fetch institution fresh from DB (don't trust req.user payload)
    const [captainUsers] = await conn.execute(
      'SELECT institution FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    const captainInstitution = captainUsers[0]?.institution || '';

    // Resolve and validate all 2 members
    const memberRows = [];
    for (const memberEmail of trimmedMembers) {
      const [users] = await conn.execute(
        'SELECT id, full_name, email, institution FROM users WHERE email = ? LIMIT 1',
        [memberEmail]
      );
      if (!users.length) {
        await conn.rollback();
        const err = new Error(`No account found for member email: ${memberEmail}`);
        err.code  = 'MEMBER_NOT_FOUND';
        err.email = memberEmail;
        throw err;
      }
      if (users[0].institution.trim().toLowerCase() !== captainInstitution.trim().toLowerCase()) {
        await conn.rollback();
        const err = new Error(
          `${users[0].full_name} is from a different institution (${users[0].institution}). ` +
          'All team members must be from the same institution.'
        );
        err.code = 'MEMBER_DIFF_INSTITUTION';
        throw err;
      }
      const [existing] = await conn.execute(
        'SELECT id FROM reg_teamquiz WHERE user_id = ? LIMIT 1',
        [users[0].id]
      );
      if (existing.length) {
        await conn.rollback();
        const err = new Error(`${users[0].full_name} is already registered for Team Quiz.`);
        err.code = 'MEMBER_ALREADY_REGISTERED';
        throw err;
      }
      memberRows.push(users[0]);
    }

    // Check captain not already registered
    const [captainExisting] = await conn.execute(
      'SELECT id FROM reg_teamquiz WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (captainExisting.length) {
      await conn.rollback();
      return null; // handled as 409 by controller
    }

    // Insert captain
    await conn.execute(
      `INSERT INTO reg_teamquiz (user_id, user_name, email, team_name, captain_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, userName, email, teamName.trim(), userId]
    );
    const [captainRows] = await conn.execute(
      'SELECT * FROM reg_teamquiz WHERE user_id = ? LIMIT 1',
      [userId]
    );

    // Insert 2 members
    const insertedMembers = [];
    for (const member of memberRows) {
      await conn.execute(
        `INSERT INTO reg_teamquiz (user_id, user_name, email, team_name, role, captain_user_id)
         VALUES (?, ?, ?, ?, 'member', ?)`,
        [member.id, member.full_name, member.email, teamName.trim(), userId]
      );
      const [memberReg] = await conn.execute(
        'SELECT * FROM reg_teamquiz WHERE user_id = ? LIMIT 1',
        [member.id]
      );
      insertedMembers.push(memberReg[0] || null);
    }

    await conn.commit();
    return { captain: captainRows[0] || null, members: insertedMembers };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getTeamQuizReg(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM reg_teamquiz WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = { registerTeamQuiz, getTeamQuizReg };