const pool = require('../config/dbConfig');

async function createSession({ title, teacherId, maxParticipants = 50 }) {
  const query = `
    INSERT INTO sessions (title, teacher_id, max_participants)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [title, teacherId, maxParticipants]);
  return result.rows[0];
}

async function getSessionById(sessionId) {
  const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
  return result.rows[0];
}

async function updateSession(sessionId, data) {
  const { title, maxParticipants } = data;
  const result = await pool.query(
    'UPDATE sessions SET title=$1, max_participants=$2 WHERE id=$3 RETURNING *',
    [title, maxParticipants, sessionId]
  );
  return result.rows[0];
}

module.exports = { createSession, getSessionById, updateSession };