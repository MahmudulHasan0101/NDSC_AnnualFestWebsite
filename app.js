/**
 * app.js
 * ──────────────────────────────────────────────────────────────────────────────
 * NDSC Annual Fest 2026 — Express application entry point.
 */

'use strict';

require('dotenv').config();

const express      = require('express');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const path         = require('path');

const authRoutes        = require('./routes/auth');
const dashboardRoutes   = require('./routes/dashboard');
const segmentRoutes     = require('./routes/segments');
const submissionRoutes  = require('./routes/submissions');
const statusRoutes      = require('./routes/status');
const { apiLimiter }    = require('./middleware/rateLimiter');
const errorHandler      = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Trust proxy (needed for rate-limiter behind Nginx / Vercel etc.) ───────── */
app.set('trust proxy', 1);

/* ── CORS ───────────────────────────────────────────────────────────────────── */
app.use(cors({
  origin:      process.env.NODE_ENV === 'production'
                 ? process.env.ALLOWED_ORIGIN
                 : 'http://localhost:3000',
  credentials: true,
}));

/* ── Body parsers ───────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

/* ── Cookie parser ──────────────────────────────────────────────────────────── */
app.use(cookieParser(process.env.COOKIE_SECRET));

/* ── Static files ───────────────────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── API rate limiter ───────────────────────────────────────────────────────── */
app.use('/api', apiLimiter);

/* ── API routes ─────────────────────────────────────────────────────────────── */
app.use('/api/auth',        authRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/segments',    segmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/status',      statusRoutes);

/* ── Health check ───────────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

/* ── Config endpoint (public) ───────────────────────────────────────────────── */
app.get('/api/config', (_req, res) => {
  res.json({
    USER_OPT_ON_REGISTRATION: process.env.USER_OPT_ON_REGISTRATION === 'true',
    IS_REGISTRATION_CLOSED: process.env.IS_REGISTRATION_CLOSED === 'true',
  });
});

/* ── SPA fallback ───────────────────────────────────────────────────────────── */
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Global error handler — MUST be last ────────────────────────────────────── */
app.use(errorHandler);

/* ── Start server ───────────────────────────────────────────────────────────── */
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`\n🚀  NDSC Fest server running on http://${HOST}:${PORT}`);
  console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`    Database    : ${process.env.DB_HOST || '(not configured)'}\n`);
});

module.exports = app;