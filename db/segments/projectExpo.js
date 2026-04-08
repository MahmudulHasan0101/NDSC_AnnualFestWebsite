'use strict';

const pool = require('../db');

const VALID_HALLS      = ['Jagadish Chandra Bose', 'Jamal Nazrul Islam', 'Nikola Tesla'];
const VALID_CATEGORIES = ['Junior 6-8', 'Secondary 9-10', 'Higher Secondary 11-12'];

/**
 * Register a participant for Project Expo.
 *
 * If partnerEmail is provided:
 *  - Looks up the partner in the users table.
 *  - If the partner does not exist, throws an error with code 'PARTNER_NOT_FOUND'.
 *  - If the partner is already registered for Project Expo, throws 'PARTNER_ALREADY_REGISTERED'.
 *  - Otherwise, auto-enrolls the partner with the same project details.
 *
 * Both inserts are wrapped in a single transaction so they succeed or fail together.
 *
 * @returns {{ primary: object, partner: object|null }}
 */
async function registerProjectExpo(userId, userName, email, hall, projectName, category, partnerEmail) {
  if (!VALID_HALLS.includes(hall))           throw new Error('Invalid hall selection.');
  if (!VALID_CATEGORIES.includes(category)) throw new Error('Invalid category selection.');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let partnerRow    = null;
    let partnerUserId = null;

    const trimmedPartnerEmail = partnerEmail?.trim() || null;

    // Fetch primary user's institution and division upfront (always needed)
    const [primaryUsers] = await conn.execute(
      'SELECT institution, division FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    const primaryInstitution = primaryUsers[0]?.institution || '';
    const primaryDivision    = primaryUsers[0]?.division    || null;

    if (trimmedPartnerEmail) {
      const [partnerUsers] = await conn.execute(
        'SELECT id, full_name, email, institution, division FROM users WHERE email = ? LIMIT 1',
        [trimmedPartnerEmail]
      );

      if (!partnerUsers.length) {
        await conn.rollback();
        const err = new Error(`No account found for partner email: ${trimmedPartnerEmail}`);
        err.code  = 'PARTNER_NOT_FOUND';
        throw err;
      }

      const partner = partnerUsers[0];

      if (partner.institution.trim().toLowerCase() !== primaryInstitution.trim().toLowerCase()) {
        await conn.rollback();
        const err = new Error(
          `Partner must be from the same institution. You are registered under "${primaryInstitution}" but ${partner.full_name} is from "${partner.institution}".`
        );
        err.code = 'PARTNER_INSTITUTION_MISMATCH';
        throw err;
      }

      partnerUserId = partner.id;

      if (partnerUserId === userId) {
        await conn.rollback();
        const err = new Error('You cannot add yourself as a partner.');
        err.code  = 'PARTNER_SELF';
        throw err;
      }

      const [existingPartnerReg] = await conn.execute(
        'SELECT id FROM reg_projectexpo WHERE user_id = ? LIMIT 1',
        [partnerUserId]
      );
      if (existingPartnerReg.length) {
        await conn.rollback();
        const err = new Error(`${partner.full_name} is already registered for Project Expo.`);
        err.code  = 'PARTNER_ALREADY_REGISTERED';
        throw err;
      }

      await conn.execute(
        `INSERT INTO reg_projectexpo
           (user_id, user_name, email, institution, division, hall, project_name, category, partner_email, partner_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [partnerUserId, partner.full_name, partner.email, partner.institution, partner.division || null, hall, projectName, category, email, userId]
      );

      const [partnerRegRows] = await conn.execute(
        'SELECT * FROM reg_projectexpo WHERE user_id = ? LIMIT 1',
        [partnerUserId]
      );
      partnerRow = partnerRegRows[0] || null;
    }

    await conn.execute(
      `INSERT INTO reg_projectexpo
         (user_id, user_name, email, institution, division, hall, project_name, category, partner_email, partner_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userName, email, primaryInstitution, primaryDivision, hall, projectName, category, trimmedPartnerEmail, partnerUserId]
    );

    const [primaryRows] = await conn.execute(
      'SELECT * FROM reg_projectexpo WHERE user_id = ? LIMIT 1',
      [userId]
    );

    await conn.commit();

    // ── Send confirmation emails ──────────────────────────────────────────────
    try {
      const Mail   = require('../../utils/mail');
      const mailer = new Mail();

      const isDhaka = (division) =>
        division?.trim().toLowerCase() === 'dhaka';

      /**
       * Build the confirmation email body for a single recipient.
       */
      function buildBody(recipientName, recipientInstitution, recipientPartnerEmail) {
        return `
          <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#e2e8f0;background:#0f1117;padding:32px;border-radius:12px;">
            <p style="color:#94a3b8;font-size:.85rem;margin-top:0;">NDSC Annual Science Festival 2025 &amp; 35th GKC</p>
            <hr style="border-color:#1e293b;margin:20px 0;" />
            <p>Dear Participant,</p>
            <p>
              Congratulations! We are delighted to confirm your registration for the
              <strong>Divisional Round of the Project Expo</strong> at the
              <strong>Notre Dame Annual Science Fest 2025 &amp; 35th GKC</strong>.
              This round provides you with an exciting opportunity to present your ideas,
              engage with fellow participants, and take the first step toward being
              considered for the final selection.
            </p>
            <p>
              The Divisional Round will allow you to receive valuable feedback, refine
              your project, and showcase your creativity and skills in a supportive and
              competitive environment. Detailed information regarding the schedule,
              participation guidelines, and instructions will be shared with you shortly.
              You may also stay updated through the official fest page:
              <a href="https://www.facebook.com/share/1bVfEgDSei/" style="color:#a78bfa;">
                facebook.com/share/1bVfEgDSei
              </a>
            </p>
            <p>
              We look forward to your active participation in making the
              <strong>Project Expo — Divisional Round</strong> and the overall event
              a meaningful and memorable experience for all.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:.88rem;">
              <tr><td style="padding:8px 0;color:#94a3b8;width:140px;">Project Name</td><td style="padding:8px 0;color:#f1f5f9;"><strong>${projectName}</strong></td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Category</td><td style="padding:8px 0;color:#f1f5f9;">${category}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Segment / Hall</td><td style="padding:8px 0;color:#f1f5f9;">${hall}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8;">Institution</td><td style="padding:8px 0;color:#f1f5f9;">${recipientInstitution}</td></tr>
              ${recipientPartnerEmail ? `<tr><td style="padding:8px 0;color:#94a3b8;">Partner</td><td style="padding:8px 0;color:#f1f5f9;">${recipientPartnerEmail}</td></tr>` : ''}
            </table>
            <p>For any queries, please feel free to contact:</p>
            <p style="line-height:1.8;">
              <strong>01613065319</strong><br/>
              Sreejoy Roy Ankon<br/>
              General Secretary<br/>
              Notre Dame Science Club
            </p>
            <p style="color:#64748b;font-size:.82rem;margin-top:16px;">
              Regards,<br/>Notre Dame Science Club
            </p>
          </div>`;
      }

      // Send to primary registrant (skip if Dhaka)
      if (!isDhaka(primaryDivision)) {
        await mailer.send({
          to:      email,
          toName:  userName,
          subject: `Project Expo Registration Confirmed — ${projectName}`,
          body:    buildBody(userName, primaryInstitution, trimmedPartnerEmail),
        });
      }

      // Send to partner if enrolled (skip if Dhaka)
      if (partnerRow && !isDhaka(partnerRow.division)) {
        await mailer.send({
          to:      partnerRow.email,
          toName:  partnerRow.user_name,
          subject: `Project Expo Registration Confirmed — ${projectName}`,
          body:    buildBody(partnerRow.user_name, partnerRow.institution, email),
        });
      }
    } catch (mailErr) {
      console.error('Project Expo confirmation email failed:', mailErr);
      // Non-fatal — registration already committed
    }

    return { primary: primaryRows[0] || null, partner: partnerRow };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getProjectExpoReg(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM reg_projectexpo WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = { registerProjectExpo, getProjectExpoReg };