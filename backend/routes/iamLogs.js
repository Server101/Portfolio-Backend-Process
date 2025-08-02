const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM iam_scans ORDER BY created_at DESC LIMIT 20');
    res.json({ success: true, results: result.rows });
  } catch (err) {
    console.error('Fetch logs error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
