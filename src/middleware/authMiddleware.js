const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/serverConfig');

// Auth middleware - checks JWT
function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
    req.user = decoded; // Store user info in request object
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;