const express = require('express');
const router = express.Router();
const analyzeThreat = require('../utils/threatAnalyzer');
const pool = require('../db');

router.post('/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  const result = analyzeThreat(url);

  try {
    await pool.query(
      'INSERT INTO threat_logs (url, score, flags, timestamp) VALUES ($1, $2, $3, $4)',
      [url, result.score, JSON.stringify(result.flags), result.timestamp]
    );
    res.json(result);
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
