// backend/routes/wordcloud.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

require('dotenv').config();

router.get('/', async (req, res) => {
  const category = req.query.category;
  if (!category) return res.status(400).json({ error: 'Category is required' });

  try {
    let keywords = [];

    if (category === 'trending') {
      // NYT Top Stories API
      const nytRes = await axios.get(
        `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${process.env.NYT_API_KEY}`
      );
      const articles = nytRes.data.results || [];
      const titles = articles.map((a) => a.title).join(' ');
      keywords = extractKeywords(titles);

    } else if (category === 'ai') {
      // Use a static example for AI or simulate a Google Trends API call
      const aiKeywords = "AI LLM GPT-4 Transformers Robotics Deep Learning Neural Networks Machine Learning NLP";
      keywords = extractKeywords(aiKeywords);

    } else if (category === 'music') {
      const musicWords = "Pop Hip-Hop Rap Jazz Classical Rock Indie EDM Synth";
      keywords = extractKeywords(musicWords);

    } else if (category === 'cars') {
      const carWords = "Tesla BMW Audi Mercedes Mustang Porsche Lamborghini Hybrid EV Sedan SUV";
      keywords = extractKeywords(carWords);

    } else {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const frequencyMap = {};
    keywords.forEach((word) => {
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    });

    const wordList = Object.keys(frequencyMap).map((key) => ({
      keyword: key,
      frequency: frequencyMap[key],
    }));

    res.json(wordList);
  } catch (err) {
    console.error('Word cloud generation failed:', err.message);
    res.status(500).json({ error: 'Failed to generate word cloud' });
  }
});

function extractKeywords(text) {
  return text
    .replace(/[.,!?'"()\-]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3); // basic filter
}

module.exports = router;
