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

// Inside routes/iamLogs.js
router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM iam_scans ORDER BY created_at DESC LIMIT 50'
    );
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    console.error('Error fetching IAM scan logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logs' });
  }
});

const AWS = require('aws-sdk');
require('dotenv').config();

const iam = new AWS.IAM({ region: process.env.AWS_REGION });

iam.listRoles({ MaxItems: 10 }, (err, data) => {
  if (err) return console.error('Error listing roles:', err);
  console.log('Found roles:', data.Roles.map(r => r.RoleName));
});

module.exports = router;
