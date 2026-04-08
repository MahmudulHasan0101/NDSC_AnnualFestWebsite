/**
 * config/cookies.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Centralised cookie options so the auth token is always set consistently.
 */

'use strict';

const IS_PROD = process.env.NODE_ENV === 'production';

/** Cookie name used for the JWT auth token. */
const AUTH_COOKIE = 'ndsc_auth';

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   IS_PROD,        // Only secure in production (HTTPS)
  sameSite: IS_PROD ? 'none' : 'lax',
  maxAge:   35 * 24 * 60 * 60 * 1000,
  path:     '/',
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  path:     '/',
};

module.exports = { AUTH_COOKIE, AUTH_COOKIE_OPTIONS, CLEAR_COOKIE_OPTIONS };
