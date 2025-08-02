// backend/routes/iamScan.js
const express = require('express');
const router = express.Router();
const { IAM } = require('aws-sdk');
const axios = require('axios');
require('dotenv').config();

// AWS SDK Configuration (uses env vars like AWS_ACCESS_KEY_ID, etc.)
const iam = new IAM();

router.get('/scan', async (req, res) => {
  try {
    const policiesRes = await iam.listPolicies({ Scope: 'Local' }).promise();
    const rolesRes = await iam.listRoles().promise();

    const results = [];

    // Iterate over policies and analyze each with Gemini
    for (const policy of policiesRes.Policies.slice(0, 5)) {
      const policyDetail = await iam.getPolicyVersion({
        PolicyArn: policy.Arn,
        VersionId: policy.DefaultVersionId,
      }).promise();

      const document = decodeURIComponent(policyDetail.PolicyVersion.Document);

      const geminiResponse = await queryGeminiAPI(document);
      results.push({
        name: policy.PolicyName,
        type: 'Policy',
        analysis: geminiResponse,
      });
    }

    // Iterate over roles and analyze trust policy
    for (const role of rolesRes.Roles.slice(0, 5)) {
      const trustPolicy = role.AssumeRolePolicyDocument;
      const geminiResponse = await queryGeminiAPI(trustPolicy);
      results.push({
        name: role.RoleName,
        type: 'Role',
        analysis: geminiResponse,
      });
    }

    res.json(results);
  } catch (error) {
    console.error('IAM scan error:', error);
    res.status(500).json({ error: 'Failed to scan IAM policies/roles.' });
  }
});

// Gemini Query Helper
async function queryGeminiAPI(policyDocument) {
  const prompt = `You are a cloud security assistant. Analyze the following IAM policy for security risks. Flag overly broad permissions, wildcard actions, missing MFA, publicly accessible resources, and any other misconfigurations.\n\nPolicy:\n${JSON.stringify(policyDocument, null, 2)}`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return 'Error querying Gemini API.';
  }
}

module.exports = router;
