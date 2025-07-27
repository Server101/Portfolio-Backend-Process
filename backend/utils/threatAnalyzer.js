// backend/utils/threatAnalyzer.js
function analyzeThreat(websiteUrl) {
  const suspicious = websiteUrl.includes('test') || websiteUrl.includes('malware');
  return {
    websiteUrl,
    threatLevel: suspicious ? 'High' : 'Low',
    description: suspicious ? 'Suspicious pattern detected in URL' : 'No threat found',
  };
}

module.exports = analyzeThreat;

/*function analyzeThreat(url) {
  const threats = [];

  if (url.includes('suspicious')) {
    threats.push('Suspicious domain keyword detected');
  }

  if (url.includes('phish')) {
    threats.push('Phishing indicators found');
  }

  const score = threats.length * 30;

  return {
    score,
    flags: threats,
    timestamp: new Date(),
  };
}

module.exports = analyzeThreat;  */
