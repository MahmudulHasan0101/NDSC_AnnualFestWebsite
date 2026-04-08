/**
 * db/db.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Creates and exports a mysql2 connection pool for Hostinger's MySQL / phpMyAdmin.
 *
 * Required env vars:
 *   DB_HOST     – usually 127.0.0.1 or your Hostinger MySQL host
 *   DB_PORT     – default 3306
 *   DB_USER     – database username
 *   DB_PASSWORD – database password
 *   DB_NAME     – database / schema name
 */

'use strict';

const mysql = require('mysql2/promise');

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error('DB_HOST, DB_USER, and DB_NAME must be set in .env');
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME,
  timezone:           'Z',
  connectTimeout:     40000,
  // ── Reuse connections aggressively (Hostinger caps connections_per_hour) ───
  waitForConnections: true,
  connectionLimit:    2,      // 2 long-lived connections is enough for low traffic
  maxIdle:            2,      // keep both slots warm so they're never destroyed
  idleTimeout:        300000, // 5 min — don't close idle connections prematurely
  queueLimit:         0,

  // ── Keep-alive — prevents Hostinger from dropping idle connections,
  //    which would force a new connection (and count against the cap) ─────────
  enableKeepAlive:       true,
  keepAliveInitialDelay: 10000, // first ping after 10 s idle
});

// Verify connectivity at startup
pool.getConnection()
  .then(conn => {
    console.log('[DB] Pool connected successfully.');
    conn.release();
  })
  .catch(err => {
    console.error('[DB] Could not connect to MySQL on startup:', err.message);
  });

module.exports = pool;
