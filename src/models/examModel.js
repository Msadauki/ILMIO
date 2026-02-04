const pool = require('../config/db');

async function createExam({ title, sessionId, duration, allowCalculator = false }) {
  const query = `
    INSERT INTO exams (title, session_id, duration, allow_calculator)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(query, [title, sessionId, duration, allowCalculator]);
  return result.rows[0];
}

async function getExamById(examId) {
  const result = await pool.query('SELECT * FROM exams WHERE id = $1', [examId]);
  return result.rows[0];
}

module.exports = { createExam, getExamById };
