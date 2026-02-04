const express = require('express');

const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('ILMIO backend is live');
});

module.exports = app;
