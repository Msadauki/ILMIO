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
const JWT_SECRET = process.env.JWT_SECRET || "ilmio_super_secret_key";

/* ===========================
   DATABASE CONNECTION
=========================== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ===========================
   FULL ILMIO SCHEMA
=========================== */
async function createFullSchema() {
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
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL,
        type VARCHAR(50),
        reference TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor_id INTEGER REFERENCES users(id),
        price NUMERIC(12,2) DEFAULT 0,
        is_live BOOLEAN DEFAULT false,
        start_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS class_participants (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        title VARCHAR(255),
        duration_minutes INTEGER,
        total_marks INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS exam_results (
        id SERIAL PRIMARY KEY,
        exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        is_read BOOLEAN DEFAULT false,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
        certificate_code VARCHAR(100) UNIQUE,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Full ILMIO schema ensured.");
  } catch (err) {
    console.error("Full schema creation error:", err);
  }
}

createFullSchema();

/* ===========================
   MIDDLEWARE: JWT AUTH
=========================== */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

/* ===========================
   HEALTH CHECK
=========================== */
app.get("/", (req, res) => {
  res.send("ILMIO BACKEND VERSION 5 RUNNING");
});

/* ===========================
   REGISTER
=========================== */
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const existing = await client.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (username,email,password,role)
       VALUES ($1,$2,$3,$4) RETURNING id,username,email,role`,
      [username, email, hashedPassword, role || "student"]
    );
    const user = userResult.rows[0];

    await client.query(`INSERT INTO profiles (user_id) VALUES ($1)`, [user.id]);
    await client.query(`INSERT INTO wallets (user_id) VALUES ($1)`, [user.id]);

    await client.query("COMMIT");
    client.release();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ===========================
   LOGIN
=========================== */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ===========================
   CLASSES
=========================== */
// Get all classes
app.get("/api/classes", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM classes ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Join a class
app.post("/api/classes/:classId/join", authenticateToken, async (req, res) => {
  const { classId } = req.params;
  try {
    await pool.query(
      `INSERT INTO class_participants (class_id,user_id)
       VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [classId, req.user.id]
    );
    res.json({ message: "Joined class successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join class" });
  }
});

/* ===========================
   EXAMS
=========================== */
// Get exams for a class
app.get("/api/classes/:classId/exams", authenticateToken, async (req, res) => {
  const { classId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM exams WHERE class_id=$1", [classId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

// Submit exam result
app.post("/api/exams/:examId/submit", authenticateToken, async (req, res) => {
  const { examId } = req.params;
  const { score } = req.body;
  try {
    await pool.query(
      `INSERT INTO exam_results (exam_id,user_id,score) VALUES ($1,$2,$3)
       ON CONFLICT (exam_id,user_id) DO UPDATE SET score=$3, submitted_at=NOW()`,
      [examId, req.user.id, score]
    );
    res.json({ message: "Exam submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit exam" });
  }
});

/* ===========================
   WALLET
=========================== */
// Get wallet
app.get("/api/wallet", authenticateToken, async (req, res) => {
  try {
    const wallet = await pool.query("SELECT * FROM wallets WHERE user_id=$1", [req.user.id]);
    res.json(wallet.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// Top-up wallet
app.post("/api/wallet/topup", authenticateToken, async (req, res) => {
  const { amount } = req.body;
  try {
    await pool.query("UPDATE wallets SET balance = balance + $1 WHERE user_id=$2", [amount, req.user.id]);
    await pool.query(
      `INSERT INTO wallet_transactions (wallet_id,amount,type,reference)
       SELECT id,$1,'topup','manual' FROM wallets WHERE user_id=$2`,
      [amount, req.user.id]
    );
    res.json({ message: "Wallet topped up successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Wallet top-up failed" });
  }
});

/* ===========================
   MESSAGES
=========================== */
// Send message
app.post("/api/messages", authenticateToken, async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    await pool.query(
      `INSERT INTO messages (sender_id,receiver_id,content) VALUES ($1,$2,$3)`,
      [req.user.id, receiverId, content]
    );
    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get messages with a user
app.get("/api/messages/:withUserId", authenticateToken, async (req, res) => {
  const { withUserId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY sent_at ASC`,
      [req.user.id, withUserId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/* ===========================
   CERTIFICATES
=========================== */
app.get("/api/certificates", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM certificates WHERE user_id=$1 ORDER BY issued_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

/* ===========================
   START SERVER
=========================== */
app.listen(PORT, () => {
  console.log(`ILMIO Backend running on port ${PORT}`);
});
