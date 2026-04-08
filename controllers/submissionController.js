/**
 * controllers/submissionController.js
 * ──────────────────────────────────────────────────────────────────────────────
 * All three segments (Wall Magazine, Digital Poster, Project Expo) accept
 * a JSON body with a single `driveLink` field. No file uploads.
 *
 * POST /api/submissions/wallmagazine   — { driveLink }
 * POST /api/submissions/digitalposter  — { driveLink }
 * POST /api/submissions/projectexpo    — { driveLink }
 * GET  /api/submissions/:segment/status
 */

'use strict';

const sq = require('../db/submissionQueries');
const { success, error } = require('../utils/response');

const DRIVE_LINK_RE = /^https:\/\/(drive\.google\.com|docs\.google\.com)\//i;

function validateDriveLink(link) {
  if (!link || typeof link !== 'string' || !link.trim())
    return 'A Google Drive link is required.';
  if (!DRIVE_LINK_RE.test(link.trim()))
    return 'Please provide a valid Google Drive URL (drive.google.com or docs.google.com).';
  return null;
}

function handleSubmitErrors(err, res) {
  if (err.code === 'INVALID_LINK')      return error(res, err.message, 400);
  if (err.code === 'NOT_REGISTERED')    return error(res, err.message, 403);
  if (err.code === 'ALREADY_SUBMITTED') return error(res, err.message, 409);
  if (err.code === 'DHAKA_EXCLUDED')    return error(res, err.message, 403);
  return null; // caller should call next(err)
}

/* ── POST /api/submissions/theoramvault ─────────────────────────────────────*/

async function submitTheorumVault(req, res, next) {
  try {
    const linkErr = validateDriveLink(req.body?.driveLink);
    if (linkErr) return error(res, linkErr, 400);

    const row = await sq.submitTheorumVault(req.user.id, req.body.driveLink);
    return success(res, { submission: row }, 'Theorum Vault  submitted successfully.', 201);
  } catch (err) {
    return handleSubmitErrors(err, res) ?? next(err);
  }
}

/* ── POST /api/submissions/digitalposter ─────────────────────────────────────*/

async function submitDigitalPoster(req, res, next) {
  try {
    const linkErr = validateDriveLink(req.body?.driveLink);
    if (linkErr) return error(res, linkErr, 400);

    const row = await sq.submitDigitalPoster(req.user.id, req.body.driveLink);
    return success(res, { submission: row }, 'Digital Poster submitted successfully.', 201);
  } catch (err) {
    return handleSubmitErrors(err, res) ?? next(err);
  }
}

/* ── POST /api/submissions/projectexpo ───────────────────────────────────────*/

async function submitProjectExpo(req, res, next) {
  try {
    const linkErr = validateDriveLink(req.body?.driveLink);
    if (linkErr) return error(res, linkErr, 400);

    const row = await sq.submitProjectExpo(req.user.id, req.body.driveLink);
    return success(res, { submission: row }, 'Project Expo video submitted successfully.', 201);
  } catch (err) {
    return handleSubmitErrors(err, res) ?? next(err);
  }
}

/* ── POST /api/submissions/videography ───────────────────────────────────────*/

async function submitVideography(req, res, next) {
  try {
    const linkErr = validateDriveLink(req.body?.driveLink);
    if (linkErr) return error(res, linkErr, 400);

    const row = await sq.submitVideography(req.user.id, req.body.driveLink);
    return success(res, { submission: row }, 'Videography submitted successfully.', 201);
  } catch (err) {
    return handleSubmitErrors(err, res) ?? next(err);
  }
}

/* ── POST /api/submissions/memeology ─────────────────────────────────────────*/

async function submitMemeology(req, res, next) {
  try {
    const linkErr = validateDriveLink(req.body?.driveLink);
    if (linkErr) return error(res, linkErr, 400);

    const row = await sq.submitMemeology(req.user.id, req.body.driveLink);
    return success(res, { submission: row }, 'Meme-o-logy submitted successfully.', 201);
  } catch (err) {
    return handleSubmitErrors(err, res) ?? next(err);
  }
}

/* ── POST /api/submissions/webdesign ─────────────────────────────────────────*/

async function submitWebDesign(req, res, next) {
  try {
    const link = req.body?.driveLink?.trim();
    if (!link || !link.startsWith('http')) {
      return error(res, 'Please provide a valid URL (Google Drive link or live site URL).', 400);
    }

    const row = await sq.submitWebDesign(req.user.id, link);
    return success(res, { submission: row }, 'Web Design submission received successfully.', 201);
  } catch (err) {
    return handleSubmitErrors(err, res) ?? next(err);
  }
}

/* ── GET /api/submissions/:segment/status ────────────────────────────────────*/

const STATUS_MAP = {
  digitalposter: sq.getDigitalPosterSubmission,
  projectexpo:   sq.getProjectExpoSubmission,
  videography:   sq.getVideographySubmission,
  theoramvault:  sq.getTheorumVaultSubmission,
  memeology:     sq.getMemeologySubmission,
  webdesign:     sq.getWebDesignSubmission,
};

async function getSubmissionStatus(req, res, next) {
  try {
    const getFn = STATUS_MAP[req.params.segment?.toLowerCase()];
    if (!getFn) return error(res, 'Unknown submission segment.', 404);

    const row = await getFn(req.user.id);

    // For webdesign, also check registration status
    if (req.params.segment?.toLowerCase() === 'webdesign') {
      const sq2 = require('../db/segmentQueries');
      const reg = await sq2.getWebDesignReg(req.user.id);
      if (!reg) return error(res, 'You are not registered for Web Page Designing.', 403);
    }

    if (req.params.segment?.toLowerCase() === 'memeology') {
      const sq2 = require('../db/segmentQueries');
      const reg = await sq2.getMemeologyReg(req.user.id);
      if (!reg) return error(res, 'You are not registered for Meme-o-logy.', 403);
    }

    return success(res, { submitted: !!row, submission: row || null });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitDigitalPoster,
  submitProjectExpo,
  submitVideography,
  submitTheorumVault,
  submitMemeology,
  submitWebDesign,
  getSubmissionStatus,
};