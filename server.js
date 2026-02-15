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

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixUsersTable() {
  try {
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
    `);

    console.log("Users table updated (is_premium ensured)");
  } catch (error) {
    console.error("Error updating users table:", error);
  }
}

fixUsersTable();

async function createUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Users table ensured");
}

createUsersTable();
