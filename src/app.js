const express = require('express');
const app = express();

const authRoutes = require('./routes/auth');

app.use(express.json());

// Mount auth routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.status(200).send('ILMIO backend live');
});

module.exports = app;
