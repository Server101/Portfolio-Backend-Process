const express = require('express'); 
const cors = require('cors');
const app = express();
const PORT = 3001;

const threatRoutes = require('./routes/threat');
const threatRoute = require('./routes/threatRoute');
app.use('/api/threat', threatRoute);

app.use(cors());
app.use(express.json());

app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, title: 'Full Stack Portfolio', tech: 'React + Node.js + EC2' },
    { id: 2, title: 'API Service', tech: 'Express + PostgreSQL' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});