// backend/db.js

const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_username',        // e.g., 'postgres'
  host: 'localhost',            // or use your cloud DB host
  database: 'your_db_name',     // your PostgreSQL DB name
  password: 'your_password',
  port: 5432,
});

module.exports = pool;
