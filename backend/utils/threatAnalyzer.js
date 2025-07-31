// backend/utils/threatAnalyzer.js
require('dotenv').config(); // Load .env variables
const axios = require('axios');

const ABUSEIPDB_KEY = process.env.ABUSEIPDB_KEY;
const VIRUSTOTAL_KEY = process.env.VIRUSTOTAL_KEY;

console.log('[DEBUG] VirusTotal Key Loaded:', !!VIRUSTOTAL_KEY);
console.log('[DEBUG] AbuseIPDB Key Loaded:', !!ABUSEIPDB_KEY);

async function analyzeThreat(websiteUrl) {
  const threats = [];
  let score = 0;

  // Local pattern checks
  if (websiteUrl.includes('malware')) {
    threats.push('Malicious keyword detected');
    score += 30;
  }
  if (websiteUrl.includes('phish')) {
    threats.push('Phishing keyword detected');
    score += 30;
  }

  // Extract hostname or IP
  let hostname;
  try {
    const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `http://${websiteUrl}`);
    hostname = urlObj.hostname;
  } catch (err) {
    threats.push('Invalid URL format');
    return {
      websiteUrl,
      threatLevel: 'Low',
      description: 'Invalid URL format',
      score,
      flags: threats,
      timestamp: new Date(),
    };
  }

  // AbuseIPDB (only for IPs)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    try {
      const abuseRes = await axios.get('https://api.abuseipdb.com/api/v2/check', {
        params: { ipAddress: hostname, maxAgeInDays: 90 },
        headers: {
          Key: ABUSEIPDB_KEY,
          Accept: 'application/json',
        },
      });

      const abuseData = abuseRes.data.data;
      if (abuseData.abuseConfidenceScore > 20) {
        threats.push(`AbuseIPDB: ${abuseData.abuseConfidenceScore}% confidence`);
        score += abuseData.abuseConfidenceScore / 2;
      }
    } catch (err) {
      console.error('AbuseIPDB Error:', err.message);
    }
  }

  // VirusTotal (URLs must be base64url-encoded)
  try {
    const encodedUrl = Buffer.from(websiteUrl).toString('base64url');
    const vtRes = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
      headers: { 'x-apikey': VIRUSTOTAL_KEY },
    });

    const stats = vtRes.data.data.attributes.last_analysis_stats;
    console.log("VirusTotal stats:", stats); // 👈 line to troubleshoot
    if (stats.malicious > 0) {
      threats.push(`VirusTotal: flagged by ${stats.malicious} engines`);
      score += stats.malicious * 10;
    }
  } catch (err) {
    console.error('VirusTotal Error:', err.message);
  }

  // Final assessment
  let threatLevel = 'Low';
  if (score >= 60) threatLevel = 'High';
  else if (score >= 30) threatLevel = 'Medium';

  return {
    websiteUrl,
    threatLevel,
    description: threats.length ? threats.join('; ') : 'No threat found',
    score,
    flags: threats, 
    timestamp: new Date(),
  };
}

module.exports = analyzeThreat;
