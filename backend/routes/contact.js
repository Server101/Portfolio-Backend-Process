const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-2' });

router.post('/', async (req, res) => {
  const FROM = process.env.SES_FROM;
  const TO = process.env.CONTACT_TO;

  console.log('[CONTACT] cfg', { region: process.env.AWS_REGION, FROM, TO });

  if (!FROM || !TO || !process.env.AWS_REGION) {
    return res.status(500).json({
      ok: false,
      error: 'Email not configured'
    });
  }

  const ses = new AWS.SES();
  const { contact_name, contact_email, contact_message } = req.body || {};

  const params = {
    Source: FROM,
    Destination: { ToAddresses: [TO] },
    Message: {
      Subject: { Data: `New contact from ${contact_name || 'Website'}` },
      Body: {
        Text: { Data:
`From: ${contact_name} <${contact_email}>
Message:
${contact_message}` }
      }
    },
    ReplyToAddresses: contact_email ? [contact_email] : []
  };

  try {
    await ses.sendEmail(params).promise();
    return res.json({ ok: true });
  } catch (err) {
    console.error('[CONTACT] SES error:', err);
    return res.status(500).json({ ok: false, error: 'SES send failed' });
  }
});
