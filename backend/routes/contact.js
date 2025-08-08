// backend/routes/contact.js
const express = require('express');
const router = express.Router();
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const ses = new SESClient({
  region: process.env.AWS_REGION || process.env.SES_REGION || 'us-east-2',
});

// simple body validation
function isValidEmail(v) {
  return typeof v === 'string' && v.includes('@');
}

router.post('/', async (req, res) => {
  try {
    const { contact_name, contact_email, contact_message } = req.body || {};

    if (!contact_name || !contact_email || !contact_message) {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }
    if (!isValidEmail(contact_email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    const TO = process.env.SES_TO;
    const FROM = process.env.SES_FROM;
    if (!TO || !FROM) {
      return res.status(500).json({ ok: false, error: 'Email not configured' });
    }

    const subject = `New contact form message from ${contact_name}`;
    const textBody =
      `Name: ${contact_name}\n` +
      `Email: ${contact_email}\n\n` +
      `Message:\n${contact_message}\n`;

    const htmlBody =
      `<p><strong>Name:</strong> ${contact_name}</p>` +
      `<p><strong>Email:</strong> ${contact_email}</p>` +
      `<p><strong>Message:</strong><br/>${String(contact_message).replace(/\n/g, '<br/>')}</p>`;

    const params = {
      Source: FROM,
      Destination: { ToAddresses: [TO] },
      ReplyToAddresses: [contact_email],
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: textBody, Charset: 'UTF-8' },
          Html: { Data: htmlBody, Charset: 'UTF-8' },
        },
      },
    };

    await ses.send(new SendEmailCommand(params));

    // success response for frontend toast
    return res.json({ ok: true, message: 'Message received! ✅' });
  } catch (err) {
    console.error('SES send error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

module.exports = router;
