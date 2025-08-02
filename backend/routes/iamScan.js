// routes/iamScan.js
const express = require('express');
const AWS = require('aws-sdk');
const axios = require('axios');
const router = express.Router();
const pool = require('../db');

const iam = new AWS.IAM({ region: process.env.AWS_REGION });

// Decode base64-encoded AssumeRolePolicyDocument if needed
const decodePolicy = (policy) => {
  try {
    if (typeof policy === 'string') {
      return JSON.parse(decodeURIComponent(policy));
    } else if (typeof policy === 'object') {
      return policy;
    } else {
      return null;
    }
  } catch (err) {
    console.error("❌ Failed to decode policy:", err.message);
    return null;
  }
};

// Dummy Gemini prompt simulation
const analyzePolicy = async (policy) => {
  try {
    const prompt = `
You are a cloud security assistant. Analyze the following IAM trust policy for security risks.
Policy:
${JSON.stringify(policy, null, 2)}
`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      { contents: [{ parts: [{ text: prompt }] }] },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis returned.";
    return text;
  } catch (err) {
    console.error("❌ Gemini analysis failed:", err.message);
    return "Failed to analyze policy.";
  }
};

router.get('/scan', async (req, res) => {
  try {
    const rolesData = await iam.listRoles({ MaxItems: 50 }).promise();
    const roles = rolesData.Roles;

    console.log("Found roles:", roles.map((r) => r.RoleName));

    const results = [];

    for (const role of roles) {
      const encoded = role.AssumeRolePolicyDocument;
      if (!encoded) {
        console.warn(`⚠️ Role ${role.RoleName} missing AssumeRolePolicyDocument`);
        continue;
      }

      const decodedPolicy = decodePolicy(encoded);
      if (!decodedPolicy) {
        console.error(`❌ Failed to decode policy for ${role.RoleName}`);
        continue;
      }

      const analysis = await analyzePolicy(decodedPolicy);

      const score = analysis.includes("wildcard") || analysis.includes("public") ? 90 :
                    analysis.includes("recommendation") ? 70 : 30;

      try {
        await pool.query(
          'INSERT INTO iam_scans (role_name, role_arn, policy, analysis, score) VALUES ($1, $2, $3, $4, $5)',
          [
            role.RoleName,
            role.Arn,
            JSON.stringify(decodedPolicy), // ✅ Fixed
            analysis,
            score,
          ]
        );
        results.push({
          role_name: role.RoleName,
          role_arn: role.Arn,
          score,
          analysis,
          policy: decodedPolicy,
        });
        console.log(`✅ Inserted ${role.RoleName}`);
      } catch (err) {
        console.error(`❌ DB Insert error for ${role.RoleName}: ${err.message}`);
      }
    }

    return res.json({ success: true, results });
  } catch (err) {
    console.error("❌ IAM scan failed:", err.message);
    return res.status(500).json({ success: false, error: "IAM scan failed." });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, role_name, role_arn, policy, analysis, score, created_at FROM iam_scans ORDER BY created_at DESC LIMIT 50'
    );
    return res.json({ logs: rows });
  } catch (err) {
    console.error("❌ Failed to load IAM logs:", err.message);
    return res.status(500).json({ error: "Failed to load logs" });
  }
});

module.exports = router;
