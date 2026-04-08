/**
 * middleware/errorHandler.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Global Express error handler.  Must be registered LAST with app.use().
 *
 * Any route or middleware that calls next(err) lands here.
 */

'use strict';

function errorHandler(err, req, res, _next) {
  // Log full stack in development; suppress in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  } else {
    console.error('[ERROR]', err.message);
  }

  // MySQL duplicate entry (e.g. unique email)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      ok:      false,
      message: 'An account with that email address already exists.',
    });
  }

  // MySQL foreign-key constraint violation
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      ok:      false,
      message: 'Referenced record does not exist.',
    });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error.';

  return res.status(status).json({ ok: false, message });
}

module.exports = errorHandler;
