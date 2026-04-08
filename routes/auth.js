/**
 * routes/auth.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Routes mounted at /api/auth
 */

'use strict';

const express        = require('express');
const router         = express.Router();

const authController    = require('../controllers/authController');
const { requireAuth }   = require('../middleware/auth');
const { authLimiter }   = require('../middleware/rateLimiter');

// POST /api/auth/send-registration-otp  — sends OTP to verify email before registration
router.post('/send-registration-otp', authLimiter, authController.sendRegistrationOtp);

// POST /api/auth/verify-registration-otp  — verifies OTP, marks email as verified
router.post('/verify-registration-otp', authLimiter, authController.verifyRegistrationOtp);

// POST /api/auth/register
router.post('/register', authLimiter, authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, authController.login);

// POST /api/auth/send-otp  — sends login OTP
router.post('/send-otp', authLimiter, authController.sendLoginOtp);

// POST /api/auth/verify-otp  — verifies login OTP, issues session
router.post('/verify-otp', authLimiter, authController.verifyLoginOtp);

// POST /api/auth/forgot-password  — sends password-reset OTP
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// POST /api/auth/reset-password  — verifies OTP and sets new password
router.post('/reset-password', authLimiter, authController.resetPassword);

// POST /api/auth/logout  (requires active session)
router.post('/logout', requireAuth, authController.logout);

// GET  /api/auth/me  — returns current user's profile
router.get('/me', requireAuth, authController.me);

// PATCH /api/auth/update-profile — update profile fields
router.patch('/update-profile', requireAuth, authController.updateProfile);

router.get('/lookup-email', requireAuth, authController.lookupEmail);

// POST /api/auth/record-dev-visit — records a visit to the developers page
router.post('/record-dev-visit', requireAuth, authController.recordDevVisit);

module.exports = router;
