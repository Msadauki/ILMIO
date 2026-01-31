const express = require('express');
const app = express();

// Import API routes
const authRoutes = require('./src/api/auth');
const userRoutes = require('./src/api/users');
const walletRoutes = require('./src/api/wallet');
const classesRoutes = require('./src/api/classes');
const examsRoutes = require('./src/api/exams');
const messagingRoutes = require('./src/api/messaging');
const liveRoutes = require('./src/api/live');
const certificatesRoutes = require('./src/api/certificates');
const adminRoutes = require('./src/api/admin');

// Middleware
const rateLimiter = require('./src/middleware/rateLimiter');
const authMiddleware = require('./src/middleware/authMiddleware');

app.use(express.json()); // Parse incoming JSON requests
app.use(rateLimiter);    // Apply rate-limiting

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Backend API is working!');
});

// Start the server on Render's port or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
