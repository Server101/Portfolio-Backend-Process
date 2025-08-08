// backend/routes/threat.js
const express = require('express');
const router = express.Router();
const analyzeThreat = require('../utils/threatAnalyzer');
const pool = require('../db');

/**
 * GET /api/threat
 * Return latest threat logs so the base path works (fixes 404).
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM threat_logs ORDER BY detected_at DESC LIMIT 100'
    );
    res.json({ success: true, results: rows });
  } catch (err) {
    console.error('Threat base route error:', err);
    res.status(500).json({ success: false, error: 'DB read failed' });
  }
});

/**
 * GET /api/threat/logs
 * Same data shape as above to keep frontend consistent.
 */
router.get('/logs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM threat_logs ORDER BY detected_at DESC'
    );
    res.json({ success: true, results: rows });
  } catch (err) {
    console.error('DB read failed:', err);
    res.status(500).json({ success: false, error: 'DB read failed' });
  }
});

/**
 * POST /api/threat/analyze
 * Analyze a URL and store the result.
 */
router.post('/analyze', async (req, res) => {
  try {
    const { websiteUrl } = req.body || {};
    if (!websiteUrl) {
      return res.status(400).json({ success: false, error: 'websiteUrl is required' });
    }

    const result = await analyzeThreat(websiteUrl); // run analyzer

    // Persist
    await pool.query(
      `INSERT INTO threat_logs
        (website_url, threat_level, description, score, flags, detected_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        result.websiteUrl,
        result.threatLevel,
        result.description,
        result.score,
        JSON.stringify(result.flags || []),
        result.timestamp || new Date().toISOString(),
      ]
    );

    res.json({ success: true, result });
  } catch (err) {
    console.error('Threat analyze error:', err);
    res.status(500).json({ success: false, error: 'Analyze or DB insert failed' });
  }
});

module.exports = router;
