'use strict';

const pool = require('../db');
const Mail   = require('../../utils/mail');

function _payment(body) {
  return {
    transaction_id:      body?.transaction_id?.trim()      || null,
    send_money_datetime: body?.send_money_datetime?.trim() || null,
  };
}

/**
 * Register a participant for Conundrum Paradox.
 * Optional partner — no institution restriction, no category.
 * Team name defaults to "no team" if not provided.
 * Same transactional pattern as Wall Magazine / Scrapbook.
 *
 * Error codes:
 *   PARTNER_NOT_FOUND          — email not in users table
 *   PARTNER_SELF               — user tried to add themselves
 *   PARTNER_ALREADY_REGISTERED — partner already enrolled
 *
 * @returns {{ primary: object, partner: object|null }}
 */
async function registerConundrumParadox(userId, userName, email, teamName, partnerEmail, body) {
  // Team name defaults to "no team" if not provided
  const team = teamName?.trim() || 'no team';
  // Partner is optional - only for Conundrum Paradox
  const trimmedPartner = partnerEmail?.trim() || null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { transaction_id, send_money_datetime } = _payment(body);
    let partnerRow    = null;
    let partnerUserId = null;

    if (trimmedPartner) {
      const [partnerUsers] = await conn.execute(
        'SELECT id, full_name, email FROM users WHERE email = ? LIMIT 1',
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

      const [existingPartnerReg] = await conn.execute(
        'SELECT id FROM reg_conundrumparadox WHERE user_id = ? LIMIT 1',
        [partner.id]
      );
      if (existingPartnerReg.length) {
        await conn.rollback();
        const err = new Error(`${partner.full_name} is already registered for Conundrum Paradox.`);
        err.code  = 'PARTNER_ALREADY_REGISTERED';
        throw err;
      }

      partnerUserId = partner.id;

      await conn.execute(
        `INSERT INTO reg_conundrumparadox
           (user_id, user_name, email, team_name, partner_email, partner_user_id, transaction_id, send_money_datetime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [partner.id, partner.full_name, partner.email, team, email, userId, transaction_id, send_money_datetime]
      );
      const [partnerRegRows] = await conn.execute(
        'SELECT * FROM reg_conundrumparadox WHERE user_id = ? LIMIT 1',
        [partner.id]
      );
      partnerRow = partnerRegRows[0] || null;
    }

    await conn.execute(
      `INSERT INTO reg_conundrumparadox
         (user_id, user_name, email, team_name, partner_email, partner_user_id, transaction_id, send_money_datetime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userName, email, team, trimmedPartner, partnerUserId, transaction_id, send_money_datetime]
    );
    const [primaryRows] = await conn.execute(
      'SELECT * FROM reg_conundrumparadox WHERE user_id = ? LIMIT 1',
      [userId]
    );

    await conn.commit();

    // ── Send confirmation emails ──────────────────────────────────────────────
    try {
      const mailer = new Mail();

      const buildBody = (recipientName, recipientPartnerEmail) => `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#e2e8f0;background:#0f1117;padding:32px;border-radius:12px;">
          <h2 style="color:#a78bfa;margin-bottom:4px;">Conundrum Paradox — Registration Received</h2>
          <p style="color:#94a3b8;font-size:.85rem;margin-top:0;">NDSC Annual Science Festival 2025 &amp; 35th GKC</p>
          <hr style="border-color:#1e293b;margin:20px 0;" />
          <p>Dear Participant,</p>
          <p>
            Thank you for registering for <strong>Conundrum Paradox</strong>, a
            <strong>70 Years Anniversary Special Segment</strong> of the
            <strong>Notre Dame Annual Science Fest 2025 &amp; 35th GKC</strong>.
          </p>
          <p>
            We have successfully received your <strong>registration and payment details</strong>,
            and your submission has been recorded.
          </p>
          <p>
            A confirmation email regarding the <strong>final status of your registration</strong>
            will be sent after the provided information is processed.
          </p>
          <p>Please keep your <strong>bKash transaction details</strong> for future reference.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:.88rem;">
            <tr><td style="padding:8px 0;color:#94a3b8;width:160px;">Team Name</td><td style="padding:8px 0;color:#f1f5f9;"><strong>${team}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Transaction ID</td><td style="padding:8px 0;color:#f1f5f9;">${transaction_id || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8;">Payment Time</td><td style="padding:8px 0;color:#f1f5f9;">${send_money_datetime || '—'}</td></tr>
            ${recipientPartnerEmail ? `<tr><td style="padding:8px 0;color:#94a3b8;">Partner</td><td style="padding:8px 0;color:#f1f5f9;">${recipientPartnerEmail}</td></tr>` : ''}
          </table>
          <p>
            Stay updated through the official event page:
            <a href="https://www.facebook.com/share/1bVfEgDSei/" style="color:#a78bfa;">
              facebook.com/share/1bVfEgDSei
            </a>
          </p>
          <p>For any queries, please feel free to contact:</p>
          <p style="line-height:1.8;">
            01613065319<br/>
            <strong>Sreejoy Roy Ankon</strong><br/>
            General Secretary<br/>
            Notre Dame Science Club
          </p>
          <p style="color:#64748b;font-size:.82rem;margin-top:16px;">
            Regards,<br/><strong>Notre Dame Science Club</strong>
          </p>
        </div>`;

      await mailer.send({
        to:      email,
        toName:  userName,
        subject: `Registration Received — Conundrum Paradox | Notre Dame Annual Science Festival 2025 & 35th GKC`,
        body:    buildBody(userName, trimmedPartner),
      });

      if (partnerRow) {
        await mailer.send({
          to:      partnerRow.email,
          toName:  partnerRow.user_name,
          subject: `Registration Received — Conundrum Paradox | Notre Dame Annual Science Festival 2025 & 35th GKC`,
          body:    buildBody(partnerRow.user_name, email),
        });
      }
    } catch (mailErr) {
      console.error('Conundrum Paradox confirmation email failed:', mailErr);
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

async function getConundrumParadoxReg(userId) {
  const [rows] = await pool.execute(
    'SELECT * FROM reg_conundrumparadox WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

module.exports = { registerConundrumParadox, getConundrumParadoxReg };