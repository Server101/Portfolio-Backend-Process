// backend/routes/github.js
const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2 if not installed
const router = express.Router();

const GH_USER = process.env.GITHUB_USER || 'Server101'; // <-- set your username here or via .env
const GH_TOKEN = process.env.GITHUB_TOKEN || '';        // optional

router.get('/repos', async (req, res) => {
  try {
    const url = `https://api.github.com/users/${GH_USER}/repos?per_page=12&sort=updated`;
    const headers = { 'User-Agent': 'ricardotech-site' };
    if (GH_TOKEN) headers.Authorization = `Bearer ${GH_TOKEN}`;

    const r = await fetch(url, { headers });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ ok: false, error: `GitHub API error: ${r.status}`, body: text });
    }
    const data = await r.json();

    // Trim each repo to only what you render
    const slim = data.map(repo => ({
      id: repo.id,
      name: repo.name,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      topics: repo.topics || [],
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
    }));

    res.json({ ok: true, repos: slim });
  } catch (err) {
    console.error('GitHub fetch failed:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch GitHub repos' });
  }
});

module.exports = router;
