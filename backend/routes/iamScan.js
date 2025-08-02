// routes/iamScan.js
const express = require('express');
const AWS = require('aws-sdk');
const axios = require('axios');
const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAybR6hl16-KY9UTgpYgqywXCnBQGOh7lohere';
const iam = new AWS.IAM({ region: process.env.AWS_REGION });

router.get('/scan', async (req, res) => {
  try {
    const rolesData = await iam.listRoles({ MaxItems: 5 }).promise();
    const roles = rolesData.Roles;

    const analyzedRoles = await Promise.all(
      roles.map(async (role) => {
        // Decode AssumeRolePolicyDocument from URI format
        const decodedPolicy = decodeURIComponent(role.AssumeRolePolicyDocument);

        // Build Gemini prompt
        const prompt = `
You are a cloud security assistant. Analyze the following IAM trust policy for security risks.
Flag overly broad permissions, wildcard actions, missing MFA, publicly accessible resources, and any other misconfigurations.

Policy:
${decodedPolicy}
        `.trim();

       // Send to Gemini API
let geminiReply = 'No analysis returned.';
try {
  const geminiRes = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  geminiReply =
    geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No analysis provided by Gemini.';
} catch (geminiErr) {
  console.error('Gemini API error:', geminiErr.response?.data || geminiErr.message);
}


        return {
          roleName: role.RoleName,
          arn: role.Arn,
          policy: decodedPolicy,
          analysis: geminiReply
        };
      })
    );

    // ✅ Return analyzed results, not just raw roles
    res.json({ success: true, results: analyzedRoles });
  } catch (err) {
    console.error('IAM scan error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
