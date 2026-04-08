/**
 * middleware/auth.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Express middleware for protecting routes that require a logged-in user.
 *
 * Usage:
 *   router.get('/dashboard', requireAuth, dashboardController.get);
 *
 * The decoded JWT payload is attached to `req.user` for downstream use.
 */

'use strict';

const { verifyToken }    = require('../utils/jwt');
const { AUTH_COOKIE }    = require('../config/cookies');
const { error }          = require('../utils/response');

/**
 * requireAuth — Hard-blocks unauthenticated requests with 401.
 * Use on all API routes that need an authenticated user.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];

  if (!token) {
    return error(res, 'Authentication required. Please log in.', 401);
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    // Token expired or tampered with
    return error(res, 'Session expired or invalid. Please log in again.', 401);
  }
}

/**
 * optionalAuth — Decodes the token if present but does not block the request.
 * Useful for pages that render differently when the user is logged in.
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Silently ignore invalid/expired token for optional routes
      req.user = null;
    }
  } else {
    req.user = null;
  }

  return next();
}

module.exports = { requireAuth, optionalAuth };
