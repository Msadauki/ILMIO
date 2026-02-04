const pool = require('../config/db');

async function logEvent(sessionId, userId, action, meta = {}) {
  const query = `
    INSERT INTO session_events (session_id, user_id, action, meta)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(query, [sessionId, userId, action, JSON.stringify(meta)]);
  return result.rows[0];
}

async function getEventsBySession(sessionId) {
  const result = await pool.query('SELECT * FROM session_events WHERE session_id = $1 ORDER BY created_at ASC', [sessionId]);
  return result.rows;
}

module.exports = { logEvent, getEventsBySession };
