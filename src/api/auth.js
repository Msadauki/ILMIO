const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/serverConfig');
const pool = require('../config/db');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const result = await userService.registerUser({ username, email, password, role });
    const token = jwt.sign({ id: result.user.id, role: result.user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ user: result.user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    const token = jwt.sign({ id: result.id, role: result.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ user: result, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
