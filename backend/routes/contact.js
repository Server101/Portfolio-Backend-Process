// backend/routes/contact.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // you already use this in threat.js

// POST /api/contact
router.post('/', async (req, res) => {
  const { contact_name, contact_email, contact_message } = req.body || {};
  if (!contact_name || !contact_email || !contact_message) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }

  try {
    await pool.query(
      `INSERT INTO contact_messages (name, email, message, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        contact_name.trim(),
        contact_email.trim(),
        contact_message.trim(),
        req.ip,
        req.get('user-agent') || null
      ]
    );
    return res.json({ ok: true, message: 'Message received!' });
  } catch (err) {
    console.error('Contact insert failed:', err);
    return res.status(500).json({ ok: false, error: 'DB insert failed' });
  }
});

// GET /api/contact/logs  (simple way to view last 100)
router.get('/logs', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, message, created_at
       FROM contact_messages
       ORDER BY created_at DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error('Contact read failed:', err);
    res.status(500).json({ ok: false, error: 'DB read failed' });
  }
});

module.exports = router;
