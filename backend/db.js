// backend/db.js

const { Pool } = require('pg');

const pool = new Pool({
  user: 'portfolio_web',        // e.g., 'postgres'
  host: 'localhost',            // or use your cloud DB host
  database: 'portfolio_db',     // your PostgreSQL DB name
  password: '5g4yu5i4ytud56i',
  port: 5432,
});

module.exports = pool;
