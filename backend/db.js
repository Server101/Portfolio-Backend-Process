// backend/db.js

const { Pool } = require('pg');

const pool = new Pool({
  user: 'portfolio_web',        // e.g., 'postgres'
  host: '3.142.144.88',            // or use your cloud DB host
  database: 'portfolio_db',     // your PostgreSQL DB name
  password: '5g4yu5i4ytud56i',
  port: 3001,
});

module.exports = pool;
