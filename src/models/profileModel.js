const pool = require('../config/dbConfig');

async function createProfile(userId, bio = '', visibility = 'private') {
  const query = `
    INSERT INTO profiles (user_id, bio, visibility)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, bio, visibility]);
  return result.rows[0];
}

async function updateProfile(userId, data) {
  const { bio, visibility } = data;
  const query = `
    UPDATE profiles
    SET bio = $1, visibility = $2
    WHERE user_id = $3
    RETURNING *;
  `;
  const result = await pool.query(query, [bio, visibility, userId]);
  return result.rows[0];
}

async function getProfile(userId) {
  const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  return result.rows[0];
}

module.exports = { createProfile, updateProfile, getProfile };