/**
 * routes/segments.js
 * ──────────────────────────────────────────────────────────────────────────────
 * /api/segments/:segment/register  POST  — enroll in a segment
 * /api/segments/:segment/status    GET   — check current user's enrolment
 *
 * Mount in app.js:
 *   const segmentRoutes = require('./routes/segments');
 *   app.use('/api/segments', segmentRoutes);
 */

'use strict';

const express            = require('express');
const router             = express.Router({ mergeParams: true });
const segmentController  = require('../controllers/segmentController');
const { requireAuth }    = require('../middleware/auth');

router.use(requireAuth);

router.post('/:segment/register', segmentController.registerSegment);
router.get('/:segment/status',    segmentController.getSegmentStatus);

module.exports = router;
