// backend/utils/threatAnalyzer.js
const axios = require('axios');

const ABUSEIPDB_KEY = process.env.ABUSEIPDB_KEY;
const VIRUSTOTAL_KEY = process.env.VIRUSTOTAL_KEY;

async function analyzeThreat(websiteUrl) {
  const threats = [];
  let score = 0;

  // Local keyword checks
  if (websiteUrl.includes('malware')) {
    threats.push('Malicious keyword detected');
    score += 30;
  }
  if (websiteUrl.includes('phish')) {
    threats.push('Phishing keyword detected');
    score += 30;
  }

  // Extract domain or IP from URL
  const urlObj = new URL(websiteUrl);
  const hostname = urlObj.hostname;

  // AbuseIPDB Check (only works on IPs, not domains)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    try {
      const abuseRes = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
        params: { ipAddress: hostname, maxAgeInDays: 90 },
        headers: {
          Key: ABUSEIPDB_KEY,
          Accept: 'application/json',
        },
      });

      const abuseData = abuseRes.data.data;
      if (abuseData.abuseConfidenceScore > 25) {
        threats.push(`AbuseIPDB: Confidence ${abuseData.abuseConfidenceScore}%`);
        score += abuseData.abuseConfidenceScore / 2; // scale down weight
      }
    } catch (err) {
      console.error('AbuseIPDB Error:', err.message);
    }
  }

  // VirusTotal URL Scan
  try {
    const vtRes = await axios.get(`https://www.virustotal.com/api/v3/urls/${Buffer.from(websiteUrl).toString('base64').replace(/=+$/, '')}`, {
      headers: { 'x-apikey': VIRUSTOTAL_KEY },
    });

    const positives = vtRes.data.data.attributes.last_analysis_stats.malicious;
    if (positives > 0) {
      threats.push(`VirusTotal: ${positives} engines flagged`);
      score += positives * 10;
    }
  } catch (err) {
    console.error('VirusTotal Error:', err.message);
  }

  // Determine threat level
  let threatLevel = 'Low';
  if (score >= 60) threatLevel = 'High';
  else if (score >= 30) threatLevel = 'Medium';

  const description = threats.length ? threats.join('; ') : 'No threat found';

  return {
    websiteUrl,
    threatLevel,
    description,
    score,
    flags: threats,
    timestamp: new Date(),
  };
}

module.exports = analyzeThreat;
