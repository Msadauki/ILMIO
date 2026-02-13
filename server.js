const express = require('express');
const app = express();

// Import routes
const authRoutes = require('./src/api/auth');

// Middleware
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('BACKEND VERSION WORKING');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
