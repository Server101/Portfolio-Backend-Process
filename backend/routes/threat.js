// backend/routes/threat.js
const express = require('express');
const router = express.Router();
const analyzeThreat = require('../utils/threatAnalyzer');
const pool = require('../db');

// Analyze Threat
router.post('/analyze', async (req, res) => {
  const { websiteUrl } = req.body;
  const result = analyzeThreat(websiteUrl);

  try {
    await pool.query(
      'INSERT INTO threat_logs (website_url, threat_level, description) VALUES ($1, $2, $3)',
      [result.websiteUrl, result.threatLevel, result.description]
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB insert failed' });
  }
});

// Get Logs with optional filter
router.get('/logs', async (req, res) => {
  const { threatLevel } = req.query;

  try {
    const query = threatLevel
      ? 'SELECT * FROM threat_logs WHERE threat_level = $1 ORDER BY detected_at DESC'
      : 'SELECT * FROM threat_logs ORDER BY detected_at DESC';

    const values = threatLevel ? [threatLevel] : [];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB read failed' });
  }
});

module.exports = router;
