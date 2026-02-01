const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Ban a user
router.post('/ban', authMiddleware, async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const action = await adminService.banUser(req.user.id, userId, reason);
    res.json({ message: 'User banned', action });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Warn a user
router.post('/warn', authMiddleware, async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const action = await adminService.warnUser(req.user.id, userId, reason);
    res.json({ message: 'User warned', action });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
