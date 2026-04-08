/**
 * utils/jwt.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Thin wrappers around the jsonwebtoken library.
 */

'use strict';

const jwt = require('jsonwebtoken');

const SECRET      = process.env.JWT_SECRET;
const EXPIRES_IN  = process.env.JWT_EXPIRES_IN || '7d';

if (!SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables.');
}

/**
 * Sign a payload and return a JWT string.
 * @param {object} payload  Data to encode (do not include sensitive fields)
 * @returns {string}
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/**
 * Verify a JWT string and return the decoded payload.
 * Throws if the token is invalid or expired.
 * @param {string} token
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
