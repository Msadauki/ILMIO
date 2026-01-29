const express = require('express');
const router = express.Router();
const learningService = require('../services/learningService');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new class/session
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, maxParticipants } = req.body;
    const session = await learningService.createClass(title, req.user.id, maxParticipants);
    res.json({ message: 'Class created successfully', session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Join a class/session
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const participant = await learningService.joinClass(req.user.id, sessionId);
    res.json({ message: 'Joined class successfully', participant });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;