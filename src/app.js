const express = require('express');
const app = express();

// Import API routes
const authRoutes = require('./api/auth');
const userRoutes = require('./api/users');
const walletRoutes = require('./api/wallet');
const classesRoutes = require('./api/classes');
const examsRoutes = require('./api/exams');
const messagingRoutes = require('./api/messaging');
const liveRoutes = require('./api/live');
const certificatesRoutes = require('./api/certificates');
const adminRoutes = require('./api/admin');
const dashboardRoutes = require('./api/dashboard');

app.use(express.json());

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
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).send('ILMIO backend live');
});

module.exports = app;
