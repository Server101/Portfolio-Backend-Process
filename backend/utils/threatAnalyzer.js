// backend/utils/threatAnalyzer.js

function analyzeThreat(websiteUrl) {
  const threats = [];
  let threatLevel = 'Low';
  let description = 'No threat found';

  // Basic pattern checks
  if (websiteUrl.includes('test') || websiteUrl.includes('malware')) {
    threats.push('Malicious keyword detected');
  }
  if (websiteUrl.includes('suspicious')) {
    threats.push('Suspicious domain keyword detected');
  }
  if (websiteUrl.includes('phish')) {
    threats.push('Phishing indicators found');
  }

  // Threat scoring logic
  const score = threats.length * 30;

  if (score >= 60) {
    threatLevel = 'High';
  } else if (score > 0) {
    threatLevel = 'Medium';
  }

  if (threats.length > 0) {
    description = threats.join('; ');
  }

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
