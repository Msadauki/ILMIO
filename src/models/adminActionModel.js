dbConfig' pool = require('../config/db');

async function logAdminAction({ adminId, userId, action, reason }) {
  const query = `
    INSERT INTO admin_actions (admin_id, user_id, action, reason)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(query, [adminId, userId, action, reason]);
  return result.rows[0];
}

async function getAdminActions(userId) {
  const result = await pool.query(
    'SELECT * FROM admin_actions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

module.exports = { logAdminAction, getAdminActions };
