const express = require('express');
const router = express.Router();
const activityService = require('../services/activityService');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Get user dashboard (activity, stats)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userDashboard = await activityService.getSessionActivities(req.user.id);
    res.json(userDashboard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
