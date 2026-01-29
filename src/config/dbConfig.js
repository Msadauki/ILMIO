// Database configuration (PostgreSQL example)
const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_db_user',        // replace with your DB username
  host: 'localhost',
  database: 'platform_db',     // replace with your DB name
  password: 'your_db_password',// replace with your DB password
  port: 5432,                  // default PostgreSQL port
});

pool.on('connect', () => console.log('✅ Connected to DB'));
pool.on('error', (err) => console.error('❌ DB Error', err));

module.exports = pool;