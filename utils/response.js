/**
 * utils/response.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Standardised JSON response helpers so every endpoint looks the same.
 */

'use strict';

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {object|Array}               data    Payload to include under `data`
 * @param {string}                     message Optional human-readable message
 * @param {number}                     status  HTTP status code (default 200)
 */
function success(res, data = {}, message = 'Success', status = 200) {
  return res.status(status).json({ ok: true, message, data });
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {string}                     message Error description
 * @param {number}                     status  HTTP status code (default 400)
 * @param {object}                     [extra] Optional extra fields to merge in
 */
function error(res, message = 'An error occurred', status = 400, extra = {}) {
  return res.status(status).json({ ok: false, message, ...extra });
}

module.exports = { success, error };
