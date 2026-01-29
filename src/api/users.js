const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const authMiddleware = require('../middleware/authMiddleware');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updatedProfile = await userService.updateUserProfile(req.user.id, req.body);
    res.json(updatedProfile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;