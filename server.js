// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --------------------
// Config
// --------------------
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'ilmio_super_secret_key';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://masilmio:vR1ux0bXnzlq5RI0eQgqQbcZVMAj06TF@dpg-d5v1u8kr85hc73dtn8o0-a/ilmiodb',
  ssl: { rejectUnauthorized: false },
});

// --------------------
// Middleware
// --------------------
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// --------------------
// Utilities
// --------------------
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// --------------------
// Auth Routes
// --------------------

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashed = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users(username, email, password, role) VALUES($1,$2,$3,$4) RETURNING id, username, email, role',
      [username, email, hashed, role]
    );
    await pool.query('INSERT INTO profiles(user_id) VALUES($1)', [result.rows[0].id]);
    await pool.query('INSERT INTO wallets(user_id,balance,currency) VALUES($1,0.00,$2)', [result.rows[0].id, 'USD']);
    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userRes.rowCount === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --------------------
// Classes
// --------------------

// Create class (Admins or special users)
app.post('/api/classes', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  try {
    const result = await pool.query(
      `INSERT INTO classes(title, description, creator_id, price, is_live, created_at)
       VALUES($1, $2, $3, 0.00, false, NOW())
       RETURNING *`,
      [title, description || '', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all classes
app.get('/api/classes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Student joins class
app.post('/api/classes/:id/join', authMiddleware, async (req, res) => {
  const classId = req.params.id;
  try {
    // Prevent duplicate joins
    const check = await pool.query('SELECT * FROM class_students WHERE class_id=$1 AND user_id=$2', [classId, req.user.id]);
    if (check.rowCount > 0) return res.status(400).json({ error: 'Already joined class' });

    await pool.query('INSERT INTO class_students(class_id, user_id) VALUES($1,$2)', [classId, req.user.id]);
    res.json({ message: 'Joined class successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to join class' });
  }
});

// --------------------
// Exams
// --------------------

// Create exam (class owner or admin)
app.post('/api/exams', authMiddleware, async (req, res) => {
  const { classId, title, totalMarks, durationMinutes } = req.body;
  if (!classId || !title || totalMarks == null) return res.status(400).json({ error: 'Missing fields' });

  try {
    // Check if user owns the class or is admin
    const classCheck = await pool.query('SELECT * FROM classes WHERE id=$1', [classId]);
    if (classCheck.rowCount === 0) return res.status(400).json({ error: 'Class not found' });
    const classData = classCheck.rows[0];
    if (classData.creator_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed to create exam for this class' });

    const result = await pool.query(
      `INSERT INTO exams(class_id, title, total_marks, duration_minutes, created_at)
       VALUES($1, $2, $3, $4, NOW())
       RETURNING *`,
      [classId, title, totalMarks, durationMinutes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Student submits exam
app.post('/api/exams/:id/submit', authMiddleware, async (req, res) => {
  const examId = req.params.id;
  const { score } = req.body;
  if (score == null) return res.status(400).json({ error: 'Score required' });

  try {
    const examCheck = await pool.query('SELECT * FROM exams WHERE id=$1', [examId]);
    if (examCheck.rowCount === 0) return res.status(400).json({ error: 'Exam not found' });

    // Prevent duplicate submissions
    const subCheck = await pool.query('SELECT * FROM exam_submissions WHERE exam_id=$1 AND user_id=$2', [examId, req.user.id]);
    if (subCheck.rowCount > 0) return res.status(400).json({ error: 'Exam already submitted' });

    await pool.query('INSERT INTO exam_submissions(exam_id, user_id, score) VALUES($1,$2,$3)', [examId, req.user.id, score]);
    await pool.query('INSERT INTO certificates(user_id, exam_id, score) VALUES($1,$2,$3)', [req.user.id, examId, score]);

    res.json({ message: 'Exam submitted and certificate generated' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to submit exam' });
  }
});

// Get certificates
app.get('/api/certificates', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM certificates WHERE user_id=$1', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --------------------
// Wallet
// --------------------
app.get('/api/wallet', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wallets WHERE user_id=$1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/wallet/topup', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount required' });
  try {
    await pool.query('UPDATE wallets SET balance = balance + $1 WHERE user_id=$2', [amount, req.user.id]);
    res.json({ message: 'Wallet topped up successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => console.log(`ILMIO backend running on port ${PORT}`));
