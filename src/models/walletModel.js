const pool = require('../config/dbConfig');

async function createWallet(userId) {
  const query = `
    INSERT INTO wallets (user_id, balance)
    VALUES ($1, 0)
    RETURNING *;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}

async function updateBalance(userId, amount) {
  const result = await pool.query(
    'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 RETURNING *',
    [amount, userId]
  );
  return result.rows[0];
}

async function getWallet(userId) {
  const result = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
  return result.rows[0];
}

module.exports = { createWallet, updateBalance, getWallet };