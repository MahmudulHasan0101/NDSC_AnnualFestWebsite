/**
 * middleware/rateLimiter.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Rate-limiting presets for different route groups.
 */

'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for auth endpoints (register, login).
 * Prevents brute-force attacks on passwords.
 */
const authLimiter = rateLimit({
  windowMs:          15 * 60 * 1000, // 15 minutes
  max:               20,             // max 20 attempts per window
  standardHeaders:   true,
  legacyHeaders:     false,
  message: { ok: false, message: 'Too many requests. Please try again in 15 minutes.' },
});

/**
 * General limiter for all other API routes.
 */
const apiLimiter = rateLimit({
  windowMs:          60 * 1000,  // 1 minute
  max:               120,        // 120 requests per minute per IP
  standardHeaders:   true,
  legacyHeaders:     false,
  message: { ok: false, message: 'Too many requests. Please slow down.' },
});

module.exports = { authLimiter, apiLimiter };
