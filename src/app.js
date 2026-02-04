// Load environment variables
require('dotenv').config();

const express = require('express');
const app = express();

// --------------------
// GLOBAL MIDDLEWARE
// --------------------
app.use(express.json()); // Parse JSON bodies

// --------------------
// API ROUTES
// --------------------
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const walletRoutes = require('./api/wallet');
const classesRoutes = require('./api/classes');
const examsRoutes = require('./api/exams');
const messagingRoutes = require('./api/messaging');
const liveRoutes = require('./api/live');
const certificatesRoutes = require('./api/certificates');
const adminRoutes = require('./api/admin');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/admin', adminRoutes);

// --------------------
// HEALTH CHECK ROUTES
// --------------------
app.get('/', (req, res) => {
  res.status(200).send('✅ ILMIO backend is live');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// 404 HANDLER
// --------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --------------------
// ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
