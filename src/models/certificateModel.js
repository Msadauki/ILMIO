dbConfig' pool = require('../config/db');

async function createCertificate({ userId, course, grade }) {
  const query = `
    INSERT INTO certificates (user_id, course, grade)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, course, grade]);
  return result.rows[0];
}

async function getCertificates(userId) {
  const result = await pool.query('SELECT * FROM certificates WHERE user_id = $1', [userId]);
  return result.rows;
}

module.exports = { createCertificate, getCertificates };
