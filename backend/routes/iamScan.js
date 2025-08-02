// routes/iamScan.js
const express = require('express');
const AWS = require('aws-sdk');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');

const iam = new AWS.IAM({ region: process.env.AWS_REGION });

router.get('/scan', async (req, res) => {
  try {
    const rolesData = await iam.listRoles({ MaxItems: 50 }).promise();
    const roles = rolesData.Roles;

    const analyzedRolesRaw = await Promise.all(
      roles.map(async (role) => {
        if (!role.AssumeRolePolicyDocument) {
          console.warn(`⚠️ Skipped ${role.RoleName} — no AssumeRolePolicyDocument`);
          return null;
        }

        let decodedPolicy;
        try {
          decodedPolicy = decodeURIComponent(
            JSON.stringify(role.AssumeRolePolicyDocument)
          );
          console.log(`✅ Decoded policy for ${role.RoleName}:`, decodedPolicy);
        } catch (err) {
          console.error(`❌ Failed to decode policy for ${role.RoleName}:`, err.message);
          return null;
        }

        const prompt = `
You are a cloud security assistant. Analyze the following IAM trust policy for security risks.
Flag overly broad permissions, wildcard actions, missing MFA, publicly accessible resources, and any other misconfigurations.

Policy:
${decodedPolicy}
        `.trim();

        let geminiReply = 'No analysis returned.';
        try {
          const geminiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }]
                }
              ]
            },
            { headers: { 'Content-Type': 'application/json' } }
          );

          geminiReply =
            geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'No analysis provided by Gemini.';
        } catch (geminiErr) {
          console.error('❌ Gemini API error:', geminiErr.response?.data || geminiErr.message);
        }

        // Risk scoring
        let score = 50;
        const lowerText = geminiReply.toLowerCase();
        if (lowerText.includes('critical') || lowerText.includes('high risk')) score = 95;
        else if (lowerText.includes('mfa') || lowerText.includes('wildcard')) score = 80;
        else if (lowerText.includes('least privilege') || lowerText.includes('audit')) score = 65;
        else if (lowerText.includes('no risk')) score = 20;

        try {
          await pool.query(
            `INSERT INTO iam_scans (role_name, arn, policy, analysis, score)
             VALUES ($1, $2, $3, $4, $5)`,
            [role.RoleName, role.Arn, decodedPolicy, geminiReply, score]
          );
        } catch (dbErr) {
          console.error(`❌ DB Insert error for ${role.RoleName}:`, dbErr.message);
        }

        console.log(`⚠️ ${role.RoleName} scored ${score}`);

        return {
          roleName: role.RoleName,
          arn: role.Arn,
          policy: decodedPolicy,
          analysis: geminiReply,
          score
        };
      })
    );

    const validResults = analyzedRolesRaw.filter(Boolean);
    console.log(`✅ Returning ${validResults.length} analyzed roles`);
    res.json({ success: true, results: validResults });
  } catch (err) {
    console.error('❌ IAM scan route error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
