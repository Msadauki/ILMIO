const express = require('express');
const router = express.Router();
const certificateService = require('../services/certificateService');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Award a certificate
router.post('/award', authMiddleware, async (req, res) => {
  try {
    const { course, grade } = req.body;
    const certificate = await certificateService.awardCertificate(req.user.id, course, grade);
    res.json({ message: 'Certificate awarded', certificate });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all certificates for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const certificates = await certificateService.getUserCertificates(req.user.id);
    res.json(certificates);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
