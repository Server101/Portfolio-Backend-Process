function analyzeThreat(url) {
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

module.exports = analyzeThreat;
