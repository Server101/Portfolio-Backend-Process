// routes/iam.js
const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

// Automatically uses the instance IAM role — NO KEYS NEEDED
const iam = new AWS.IAM({ region: process.env.AWS_REGION });

router.get('/scan', async (req, res) => {
  try {
    const data = await iam.listRoles({ MaxItems: 5 }).promise();
    res.json({ success: true, roles: data.Roles });
  } catch (error) {
    console.error('IAM listRoles error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
