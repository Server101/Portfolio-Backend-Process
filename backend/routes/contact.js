// backend/routes/contact.js
const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

// Region from env (defaults to us-east-2 which is your setup)
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' });

router.post('/', async (req, res) => {
  const FROM = process.env.SES_FROM;
  const TO = process.env.CONTACT_TO;

  // Debug to confirm env vars are visible at runtime
  console.log('[CONTACT] env:', {
    AWS_REGION: process.env.AWS_REGION,
    SES_FROM: FROM,
    CONTACT_TO: TO,
  });

  if (!FROM || !TO || !process.env.AWS_REGION) {
    return res.status(500).json({ ok: false, error: 'Email not configured' });
  }

  const { contact_name, contact_email, contact_message } = req.body || {};
  if (!contact_name || !contact_email || !contact_message) {
    return res.status(400).json({ ok: false, error: 'Missing fields' });
  }

  const ses = new AWS.SES();

  const params = {
    Source: FROM,
    Destination: { ToAddresses: [TO] },
    Message: {
      Subject: { Data: `New contact from ${contact_name}` },
      Body: {
        Text: {
          Data:
`From: ${contact_name} <${contact_email}>
Message:
${contact_message}`,
        },
      },
    },
    ReplyToAddresses: [contact_email],
  };

  try {
    await ses.sendEmail(params).promise();
    return res.json({ ok: true, message: 'Message received!' });
  } catch (err) {
    console.error('[CONTACT] SES error:', err);
    return res.status(500).json({ ok: false, error: 'SES send failed' });
  }
});

module.exports = router;
