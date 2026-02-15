require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ===========================
   DATABASE CONNECTION
=========================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===========================
   CREATE FULL ILMIO SCHEMA
=========================== */

async function createSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        is_premium BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        avatar_url TEXT,
        country VARCHAR(100),
        level VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        balance NUMERIC(12,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("ILMIO schema ensured.");
  } catch (err) {
    console.error("Schema creation error:", err);
  }
}

createSchema();

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/", (req, res) => {
  res.send("ILMIO BACKEND VERSION 2 RUNNING");
});

/* ===========================
   REGISTER
=========================== */

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const existing = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userResult = await client.query(
        `INSERT INTO users (username, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, email, role`,
        [username, email, hashedPassword, role || "student"]
      );

      const user = userResult.rows[0];

      await client.query(
        `INSERT INTO profiles (user_id) VALUES ($1)`,
        [user.id]
      );

      await client.query(
        `INSERT INTO wallets (user_id) VALUES ($1)`,
        [user.id]
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "User registered successfully",
        user
      });

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ===========================
   LOGIN
=========================== */

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
