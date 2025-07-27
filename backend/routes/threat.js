// backend/routes/threat.js
const express = require('express');
const router = express.Router();
const analyzeThreat = require('../utils/threatAnalyzer');
const pool = require('../db');

// POST /api/threat/analyze
router.post('/analyze', async (req, res) => {
  const { websiteUrl } = req.body;
  const result = analyzeThreat(websiteUrl);

  try {
    await pool.query(
      `INSERT INTO threat_logs 
        (website_url, threat_level, description, score, flags, detected_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        result.websiteUrl,
        result.threatLevel,
        result.description,
        result.score,
        JSON.stringify(result.flags),
        result.timestamp,
      ]
    );
    res.json(result);
  } catch (err) {
    console.error('DB insert failed:', err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

// GET /api/threat/logs
router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM threat_logs ORDER BY detected_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('DB read failed:', err);
    res.status(500).json({ error: 'DB read failed' });
  }
});

module.exports = router;
