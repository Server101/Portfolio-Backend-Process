// routes/iamScan.js
const express = require('express');
const AWS = require('aws-sdk');
const axios = require('axios');
const router = express.Router();

const iam = new AWS.IAM({ region: process.env.AWS_REGION });

router.get('/scan', async (req, res) => {
  try {
    const rolesData = await iam.listRoles({ MaxItems: 5 }).promise();
    const roles = rolesData.Roles;

    const analyzedRoles = await Promise.all(
      roles.map(async (role) => {
        const decodedPolicy = decodeURIComponent(role.AssumeRolePolicyDocument);
        const prompt = `
You are a cloud security assistant. Analyze the following IAM trust policy for security risks. 
Flag overly broad permissions, wildcard actions, missing MFA, publicly accessible resources, and any other misconfigurations.

Policy:
${decodedPolicy}
        `.trim();

        // Send to Gemini
        const geminiRes = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          {
            contents: [
              {
                parts: [{ text: prompt }],
                role: 'user'
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': process.env.GEMINI_API_KEY,
            }
          }
        );

        const geminiReply = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';

        return {
          roleName: role.RoleName,
          arn: role.Arn,
          policy: decodedPolicy,
          analysis: geminiReply,
        };
      })
    );

    res.json({ success: true, results: analyzedRoles });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
