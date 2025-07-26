const express = require('express');
const router = express.Router();
const analyzeThreat = require('../utils/threatAnalyzer');

router.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const result = await analyzeThreat(url);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during threat analysis' });
  }
});

module.exports = router;
