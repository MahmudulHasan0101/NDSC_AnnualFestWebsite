/**
 * controllers/authController.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Handles user registration, login, logout, and session status.
 *
 * Registration additions:
 *   - cr_dr_ref_code (optional) — validated against cr_dr table;
 *     on match, that CR/DR's contribution counter is incremented by 1.
 */

'use strict';

const bcrypt   = require('bcrypt');
const db       = require('../db/queries');
const Mail     = require('../utils/mail');
const { signToken }              = require('../utils/jwt');
const { success, error }         = require('../utils/response');
const { AUTH_COOKIE, AUTH_COOKIE_OPTIONS, CLEAR_COOKIE_OPTIONS } = require('../config/cookies');

const BCRYPT_ROUNDS = 12;

/* ── Validation helpers ────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Bangladesh mobile: 01[3-9] followed by 8 digits (normalised, no country code)
const BD_PHONE_RE = /^01[3-9]\d{8}$/;

function normalizeBdPhone(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s\-().]/g, '').replace(/^(\+?880)/, '0');
  return BD_PHONE_RE.test(cleaned) ? cleaned : null;
}

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const GENDERS      = ['male', 'female', 'other', 'prefer_not_to_say'];

const BD_DIVISIONS = [
  'Barisal', 'Chittagong', 'Dhaka', 'Khulna',
  'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet',
];

const STUDENT_CLASSES = [
  'Class 1','Class 2','Class 3','Class 4','Class 5',
  'Class 6','Class 7','Class 8','Class 9', 'Class 10',
  'SSC','HSC 1st Year','HSC 2nd Year',
];

// Mirrors the fake-institution heuristic in register.js
const FAKE_INST_PATTERNS = [
  /^(n\/a|na|none|null|nil|nope|no|not applicable)$/i,
  /^(test|testing|asdf|qwerty|abcd|1234|xxxx|zzzz|dummy|fake|random)$/i,
  /^(.)\1{4,}$/,
  /^[\W\d]+$/,
];
const MIN_INST_WORDS = 2;

function validateInstitution(value) {
  const v = (value || '').trim();
  if (v.length < 4) return false;
  for (const pattern of FAKE_INST_PATTERNS) {
    if (pattern.test(v)) return false;
  }
  const words = v.split(/\s+/).filter(w => /[a-zA-Z\u0980-\u09FF]/.test(w));
  return words.length >= MIN_INST_WORDS;
}

// Mirrors the password rules in register.js
const COMMON_PASSWORDS = new Set([
  '12345678','123456789','1234567890','password','password1','password123',
  'qwerty123','qwertyuiop','iloveyou','abc12345','admin123','welcome1',
  'monkey123','dragon123','master123','sunshine','princess','football',
  'superman','batman123','letmein1','trustno1','shadow12','michael1',
  'jessica1','charlie1','donald123','passw0rd','p@ssword','p@ssw0rd',
  '11111111','00000000','99999999','55555555','88888888','12341234',
  'abcd1234','test1234','hello123','login123','changeme','mustang1',
  'access12','starwars','whatever','baseball','soccer123','hockey123',
]);

function validatePasswordStrength(pw) {
  if (!pw || pw.length < 8)                       return 'Password must be at least 8 characters.';
  if (COMMON_PASSWORDS.has(pw.toLowerCase()))     return 'This password is too common. Please choose a stronger one.';
  if (!/[A-Za-z]/.test(pw))                       return 'Password must contain at least one letter.';
  if (!/\d/.test(pw))                             return 'Password must contain at least one number.';
  return null;
}

function validateRegisterBody(body) {
  const errors = [];

  // Full name — at least 3 chars (mirrors register.js)
  if (!body.full_name?.trim() || body.full_name.trim().length < 3)
                                            errors.push('Please enter your full name (at least 3 characters).');
  if (!EMAIL_RE.test(body.email))           errors.push('A valid email address is required.');

  // Phone — valid Bangladeshi mobile number; also normalise for storage
  if (!normalizeBdPhone(body.phone))        errors.push('Enter a valid Bangladeshi number (e.g. 01XXXXXXXXX — 11 digits).');

  // Institution — heuristic matching the frontend
  if (!validateInstitution(body.institution))
                                            errors.push('Please enter a real institution name (e.g. "Notre Dame College").');

  if (!BD_DIVISIONS.includes(body.division))
                                            errors.push('Please select a valid division.');
  if (!STUDENT_CLASSES.includes(body.student_class))
                                            errors.push('Please select a valid class.');

  // Address — at least 5 chars (mirrors register.js)
  if (!body.address?.trim() || body.address.trim().length < 5)
                                            errors.push('Please enter your address.');

  if (!BLOOD_GROUPS.includes(body.blood_group))
                                            errors.push(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}.`);
  if (!GENDERS.includes(body.gender))       errors.push(`Gender must be one of: ${GENDERS.join(', ')}.`);

  // Password strength — same rules as the frontend
  const pwError = validatePasswordStrength(body.password);
  if (pwError) errors.push(pwError);

  return errors;
}

/* ── Email helpers ─────────────────────────────────────────────────────────── */

function sendRegistrationEmail(to, fullName) {
  const mail = new Mail();
  return mail.send({
    to,
    subject: 'Registration Confirmed – Notre Dame Annual Science Fest 2025 & 35th GKC',
    body: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
        <p>Dear ${fullName},</p>

        <p>Congratulations! We are pleased to confirm that your registration for the
        <strong>Notre Dame Annual Science Fest 2025 &amp; 35th GKC</strong> has been
        successfully completed. Your participation in the event is now officially confirmed.</p>

        <p>With your registration complete, you will be eligible to take part in your chosen
        segments, engage with fellow participants, and benefit from all the activities,
        workshops, and competitions organized as part of this prestigious event. Detailed
        information regarding schedules, guidelines, and participation instructions will be
        shared with you in due course. You may also stay updated through the official event
        page:
        <a href="https://www.facebook.com/share/1bVfEgDSei/">
          https://www.facebook.com/share/1bVfEgDSei/
        </a></p>

        <p>We are excited to have you on board and look forward to your active participation
        in making the Notre Dame Annual Science Fest 2025 &amp; 35th GKC a successful and
        memorable experience.</p>

        <p>For any queries, please feel free to contact:<br/>
        <strong>01613065319</strong><br/>
        Sreejoy Roy Ankon<br/>
        General Secretary<br/>
        Notre Dame Science Club</p>

        <p>Regards,<br/>
        <strong>Notre Dame Science Club</strong></p>
      </div>
    `,
  });
}


async function lookupEmail(req, res, next) {
  try {
    const email = req.query.email?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error(res, 'A valid email query parameter is required.', 400);
    }

    // Prevent users from looking up their own email (cosmetic — server won't break either way)
    if (email.toLowerCase() === req.user.email.toLowerCase()) {
      return error(res, 'You cannot add yourself as a partner.', 400);
    }

    const user = await db.findUserByEmail(email);

    if (!user) {
      return success(res, { exists: false });
    }

    return success(res, { exists: true, full_name: user.full_name, institution: user.institution });
  } catch (err) {
    next(err);
  }
}




/**
 * POST /api/auth/send-registration-otp
 * Body: { email }
 * Sends a registration OTP. The email must NOT already be registered.
 */
async function sendRegistrationOtp(req, res, next) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email || !EMAIL_RE.test(email)) return error(res, 'A valid email is required.', 422);

    // Block if already registered — inform user they can log in instead
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return error(res, 'This email is already registered. Please log in instead or use a different email.', 409);
    }

    const otp = generateOtp();
    await db.createOtp(email, otp, 'registration', otpExpiry());
    sendOtpEmail(email, 'there', otp, 'registration').catch(e =>
      console.error('[Registration OTP email error]', e)
    );

    return success(res, {}, 'OTP sent to your email. It is valid for 10 minutes.');
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/verify-registration-otp
 * Body: { email, otp }
 * Verifies the registration OTP. Returns a short-lived verified token
 * (we reuse the OTP record — once verifyOtp() marks it used, the register
 * endpoint checks a separate flag we store in a signed cookie or header).
 *
 * Simpler approach used here: we issue a plain flag in the response body
 * (`email_verified: true`) and the client passes it along with the
 * registration payload. The server re-checks by looking for a recently
 * consumed 'registration' OTP for that email within the same request cycle.
 *
 * Instead, we use a second purpose token 'registration_verified' that is
 * created upon successful verification, so the register endpoint can confirm it.
 */
async function verifyRegistrationOtp(req, res, next) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp   = req.body.otp?.trim();
    if (!email || !otp) return error(res, 'Email and OTP are required.', 422);

    const valid = await db.verifyOtp(email, otp, 'registration');
    if (!valid) return error(res, 'Invalid or expired OTP. Please request a new one.', 401);

    // Plant a short-lived "verified" token so /register can confirm the email was verified
    await db.createOtp(email, 'VERIFIED', 'registration_verified', otpExpiry());

    return success(res, { email_verified: true }, 'Email verified. You may now complete registration.');
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/register
 * Body: { full_name, email, phone, institution, division, student_class, address,
 *         blood_group, gender, password, cr_dr_ref_code? }
 */
async function register(req, res, next) {
  try {
    const body = req.body;

    // 1. Confirm that email was OTP-verified before this request
    const emailToCheck = body.email?.toLowerCase().trim();
    const emailVerified = await db.verifyOtp(emailToCheck, 'VERIFIED', 'registration_verified');
    if (!emailVerified) {
      return error(res, 'Email address has not been verified. Please verify your email with the OTP before registering.', 403, {
        errors: ['Email not verified.'],
      });
    }

    // 2. Input validation
    const validationErrors = validateRegisterBody(body);
    if (validationErrors.length) {
      return error(res, validationErrors.join(' '), 422, { errors: validationErrors });
    }

    // 3. Validate CR/DR reference code if provided
    let crDrRow = null;
    const refCode = body.cr_dr_ref_code?.trim() || null;
    if (refCode) {
      crDrRow = await db.findCrDrByCode(refCode);
      if (!crDrRow) {
        return error(res, 'Invalid reference code. Please check with your CR/DR.', 422, {
          errors: ['Invalid reference code.'],
        });
      }
    }

    // 3b. Validate Club reference code if provided
    let clubRow = null;
    const clubRefCode = body.club_ref_code?.trim() || null;
    if (clubRefCode) {
      clubRow = await db.findClubByCode(clubRefCode);
      if (!clubRow) {
        return error(res, 'Invalid club reference code. Please check with your club representative.', 422, {
          errors: ['Invalid club reference code.'],
        });
      }
    }

    // 4. Hash password
    const password_hash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    // 5. Persist user  (phone is normalised to bare 01XXXXXXXXX format)
    const user = await db.createUser({
      full_name:      body.full_name.trim(),
      email:          body.email.toLowerCase().trim(),
      phone:          normalizeBdPhone(body.phone),
      institution:    body.institution.trim(),
      division:       body.division,
      student_class:  body.student_class,
      address:        body.address.trim(),
      blood_group:    body.blood_group,
      gender:         body.gender,
      password_hash,
      cr_dr_ref_code: refCode,
      club_ref_code:  clubRefCode,
    });

    // 6. Increment CR/DR contribution (non-blocking)
    if (crDrRow) {
      db.incrementCrDrContribution(crDrRow.id).catch(err =>
        console.error('[CR/DR increment error]', err)
      );
    }

    // 6b. Increment Club contribution (non-blocking)
    if (clubRow) {
      db.incrementClubContribution(clubRow.id).catch(err =>
        console.error('[Club increment error]', err)
      );
    }

    // 7. Send confirmation email (non-blocking — mail failure must not break registration)
    sendRegistrationEmail(user.email, user.full_name).catch(err =>
      console.error('[Registration email error]', err)
    );

    // 7. Issue session cookie
    const token = signToken({ id: user.id, email: user.email, full_name: user.full_name });
    res.cookie(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS);

    return success(res, { user }, 'Registration successful. Welcome!', 201);

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required.', 422);
    }

    const user = await db.findUserByEmail(email.toLowerCase().trim());

    // Constant-time comparison to prevent timing attacks
    const dummyHash = '$2b$12$invalidhashpadding000000000000000000000000000000000000000';
    const hashToCheck = user ? user.password_hash : dummyHash;
    const passwordMatch = await bcrypt.compare(password, hashToCheck);

    if (!user || !passwordMatch) {
      return error(res, 'Invalid email or password.', 401);
    }

    const token = signToken({ id: user.id, email: user.email, full_name: user.full_name });
    res.cookie(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS);

    const { password_hash: _, ...safeUser } = user;
    return success(res, { user: safeUser }, 'Login successful.');

  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.clearCookie(AUTH_COOKIE, CLEAR_COOKIE_OPTIONS);
  return success(res, {}, 'Logged out successfully.');
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) return error(res, 'User not found.', 404);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
}

/* ── OTP helpers ───────────────────────────────────────────────────────────── */

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpExpiry() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  return d;
}

function sendOtpEmail(to, fullName, otpCode, purpose) {
  const purposeLabel =
    purpose === 'login'        ? 'Login Verification'    :
    purpose === 'registration' ? 'Registration Verification' :
                                 'Password Reset';
  // OTP emails are sent from the dedicated OTP Brevo account / subdomain
  const mail = new Mail(); //TEMPORARY: new Mail('otp') => new Mail() cuz if idots spamming otp and Brevo ran out of credits, we don't want to break registration emails which use the main Mail instance
  return mail.send({
    to,
    subject: `${purposeLabel} OTP – Notre Dame Annual Science Fest 2025`,
    body: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;">
        <p>Dear ${fullName},</p>
        <p>Your one-time password (OTP) for <strong>${purposeLabel}</strong> is:</p>
        <div style="text-align:center;margin:30px 0;">
          <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#6d28d9;">${otpCode}</span>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Regards,<br/><strong>Notre Dame Science Club</strong></p>
      </div>
    `,
  });
}

/**
 * POST /api/auth/send-otp
 * Body: { email }  — sends login OTP
 */
async function sendLoginOtp(req, res, next) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email || !EMAIL_RE.test(email)) return error(res, 'A valid email is required.', 422);

    const user = await db.findUserByEmail(email);
    if (!user) return error(res, 'No account found with this email.', 404);

    const otp = generateOtp();
    await db.createOtp(email, otp, 'login', otpExpiry());
    sendOtpEmail(email, user.full_name, otp, 'login').catch(e => console.error('[OTP email error]', e));

    return success(res, {}, 'OTP sent to your email.');
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }  — verifies login OTP, issues session
 */
async function verifyLoginOtp(req, res, next) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp   = req.body.otp?.trim();
    if (!email || !otp) return error(res, 'Email and OTP are required.', 422);

    const valid = await db.verifyOtp(email, otp, 'login');
    if (!valid) return error(res, 'Invalid or expired OTP.', 401);

    const user = await db.findUserByEmail(email);
    if (!user) return error(res, 'User not found.', 404);

    const token = signToken({ id: user.id, email: user.email, full_name: user.full_name });
    res.cookie(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS);

    const { password_hash: _, ...safeUser } = user;
    return success(res, { user: safeUser }, 'Login successful.');
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
async function forgotPassword(req, res, next) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email || !EMAIL_RE.test(email)) return error(res, 'A valid email is required.', 422);

    const user = await db.findUserByEmail(email);
    // Always respond OK to prevent email enumeration
    if (!user) return success(res, {}, 'If an account exists, an OTP has been sent.');

    const otp = generateOtp();
    await db.createOtp(email, otp, 'forgot_password', otpExpiry());
    sendOtpEmail(email, user.full_name, otp, 'forgot_password').catch(e => console.error('[Forgot PW email error]', e));

    return success(res, {}, 'If an account exists, an OTP has been sent.');
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword }
 */
async function resetPassword(req, res, next) {
  try {
    const email       = req.body.email?.toLowerCase().trim();
    const otp         = req.body.otp?.trim();
    const newPassword = req.body.newPassword;

    if (!email || !otp || !newPassword) return error(res, 'Email, OTP, and new password are required.', 422);

    const pwError = validatePasswordStrength(newPassword);
    if (pwError) return error(res, pwError, 422);

    const valid = await db.verifyOtp(email, otp, 'forgot_password');
    if (!valid) return error(res, 'Invalid or expired OTP.', 401);

    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db.updateUserPasswordByEmail(email, hash);

    return success(res, {}, 'Password reset successfully. You can now log in.');
  } catch (err) { next(err); }
}

/**
 * PATCH /api/auth/update-profile
 * Requires auth. Body: fields to update (+ current_password for password change)
 */
const PROFILE_EDIT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

/**
 * POST /api/auth/record-dev-visit
 * Records a visit to the developers page for the authenticated user.
 */
async function recordDevVisit(req, res, next) {
  try {
    const userId = req.user.id;
    await db.recordDevVisit(userId);
    return success(res, {}, 'Visit recorded.');
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const body = req.body;
    const userId = req.user.id;

    const user = await db.findUserById(userId);
    if (!user) return error(res, 'User not found.', 404);

    // Enforce one-week edit cooldown
    if (user.last_profile_updated_at) {
      const lastEdit   = new Date(user.last_profile_updated_at).getTime();
      const elapsed    = Date.now() - lastEdit;
      if (elapsed < PROFILE_EDIT_COOLDOWN_MS) {
        const nextAllowed = new Date(lastEdit + PROFILE_EDIT_COOLDOWN_MS);
        const formatted  = nextAllowed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        return error(res, `Profile can only be edited once per week. You can edit again on ${formatted}.`, 429, {
          next_allowed_at: nextAllowed.toISOString(),
        });
      }
    }

    const updates = {};

    if (body.full_name !== undefined) {
      const name = body.full_name.trim();
      if (name.length < 3) return error(res, 'Full name must be at least 3 characters.', 422);
      updates.full_name = name;
    }
    if (body.phone !== undefined) {
      const cleaned = normalizeBdPhone(body.phone);
      if (!cleaned) return error(res, 'Enter a valid Bangladeshi phone number.', 422);
      updates.phone = cleaned;
    }
    if (body.institution !== undefined) {
      if (!validateInstitution(body.institution)) return error(res, 'Please enter a real institution name.', 422);
      updates.institution = body.institution.trim();
    }
    if (body.division !== undefined)      updates.division      = body.division;
    if (body.student_class !== undefined) updates.student_class = body.student_class;
    if (body.address !== undefined) {
      if (body.address.trim().length < 5) return error(res, 'Please enter a valid address.', 422);
      updates.address = body.address.trim();
    }
    if (body.blood_group !== undefined)   updates.blood_group   = body.blood_group;
    if (body.gender !== undefined)        updates.gender        = body.gender;

    // Password change — requires current password
    if (body.new_password) {
      if (!body.current_password) return error(res, 'Current password is required to set a new one.', 422);
      const fullUser = await db.findUserByEmail(user.email);
      const match = await bcrypt.compare(body.current_password, fullUser.password_hash);
      if (!match) return error(res, 'Current password is incorrect.', 401);
      const pwError = validatePasswordStrength(body.new_password);
      if (pwError) return error(res, pwError, 422);
      updates.password_hash = await bcrypt.hash(body.new_password, BCRYPT_ROUNDS);
    }

    const updated = await db.updateUser(userId, updates);
    return success(res, { user: updated }, 'Profile updated successfully.');
  } catch (err) { next(err); }
}

module.exports = { register, login, logout, me, lookupEmail, sendLoginOtp, verifyLoginOtp, forgotPassword, resetPassword, updateProfile, sendRegistrationOtp, verifyRegistrationOtp, recordDevVisit };