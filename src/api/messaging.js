const express = require('express');
const router = express.Router();
const messagingService = require('../services/messagingService');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const sentMessage = await messagingService.sendUserMessage(req.user.id, receiverId, message);
    res.json({ message: 'Message sent successfully', sentMessage });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await messagingService.getUserConversation(req.user.id, req.params.userId);
    res.json({ conversation: messages });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
