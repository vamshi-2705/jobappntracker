const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
  process.exit(-1);
});

/**
 * Run a parameterized query against the pool.
 * @param {string} text - SQL query
 * @param {Array} [params] - Query parameters
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
