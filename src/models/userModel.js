const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');

async function createUser({ username, email, password, role = 'student' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (username, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, role, is_premium;
  `;
  const values = [username, email, hashedPassword, role];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

module.exports = { createUser, getUserById, getUserByEmail };