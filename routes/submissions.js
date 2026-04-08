/**
 * routes/submissions.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Mount in app.js:
 *   const submissionRoutes = require('./routes/submissions');
 *   app.use('/api/submissions', submissionRoutes);
 *
 * All routes accept JSON bodies — no multipart/file upload handling needed.
 */

'use strict';

const express              = require('express');
const router               = express.Router();
const submissionController = require('../controllers/submissionController');
const { requireAuth }      = require('../middleware/auth');

router.use(requireAuth);

router.post('/digitalposter',      submissionController.submitDigitalPoster);
router.post('/projectexpo',        submissionController.submitProjectExpo);
router.post('/videography',        submissionController.submitVideography);
router.post('/theoramvault',       submissionController.submitTheorumVault);
router.post('/memeology',          submissionController.submitMemeology);
router.post('/webdesign',          submissionController.submitWebDesign);

router.get('/:segment/status',     submissionController.getSubmissionStatus);

module.exports = router;