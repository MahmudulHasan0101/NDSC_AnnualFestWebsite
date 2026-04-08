/**
 * routes/dashboard.js (updated)
 * Removed: /events and /events/:id/register — replaced by /api/segments/*
 */

'use strict';

const express         = require('express');
const router          = express.Router();
const dashController  = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/',              dashController.getDashboard);
router.get('/notifications', dashController.getNotifications);

module.exports = router;
