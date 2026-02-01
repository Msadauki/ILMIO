const express = require('express');
const router = express.Router();
const walletService = require('../services/walletService');
const authMiddleware = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Get user wallet
router.get('/', authMiddleware, async (req, res) => {
  try {
    const wallet = await walletService.getUserWallet(req.user.id);
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add funds to wallet
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const updatedWallet = await walletService.addFunds(req.user.id, amount);
    res.json(updatedWallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deduct funds from wallet
router.post('/deduct', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const updatedWallet = await walletService.deductFunds(req.user.id, amount);
    res.json(updatedWallet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
