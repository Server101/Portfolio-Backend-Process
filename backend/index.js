const express = require('express'); 
const cors = require('cors');
const app = express();
const PORT = 3001;

const threatRoutes = require('./routes/threat'); //  correct import

app.use(cors());
app.use(express.json());

// ✅ Mount correct router
app.use('/api/threat', threatRoutes);

// Optional test route
app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, title: 'Full Stack Portfolio', tech: 'React + Node.js + EC2' },
    { id: 2, title: 'API Service', tech: 'Express + PostgreSQL' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
