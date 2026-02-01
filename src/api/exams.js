middlewareiddlewareeiddleware express = require('express');
const router = express.Router();
const learningService = require('../services/learningService');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Create an exam
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, sessionId, duration, allowCalculator } = req.body;
    const exam = await learningService.scheduleExam(sessionId, title, duration, allowCalculator);
    res.json({ message: 'Exam scheduled', exam });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start an exam
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { examId } = req.body;
    const { exam, rules } = await learningService.startExam(examId, req.user);
    res.json({ exam, rules });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
