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
