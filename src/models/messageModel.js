const pool = require('../config/dbConfig');

async function sendMessage({ senderId, receiverId, message }) {
  const query = `
    INSERT INTO messages (sender_id, receiver_id, message)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [senderId, receiverId, message]);
  return result.rows[0];
}

async function getMessages(user1, user2) {
  const result = await pool.query(
    `SELECT * FROM messages 
     WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1)
     ORDER BY created_at ASC`,
    [user1, user2]
  );
  return result.rows;
}

module.exports = { sendMessage, getMessages };