const express = require('express');
const router = express.Router();
const learningService = require('../services/learningService');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Enable calculator for a user in a live session
router.post('/enable-calculator', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    await learningService.enableCalculator(sessionId, req.user.id);
    res.json({ message: 'Calculator enabled' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Disable calculator for a user in a live session
router.post('/disable-calculator', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    await learningService.disableCalculator(sessionId, req.user.id);
    res.json({ message: 'Calculator disabled' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
