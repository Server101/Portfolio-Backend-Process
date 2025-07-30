 require('dotenv').config();
const express = require('express'); 
const cors = require('cors');
const app = express();
const PORT = 3001;



// ✅ Middleware (must come before route handlers)
app.use(cors());
app.use(express.json());

// ✅ Route: Threat routes
const threatRoutes = require('./routes/threat'); 
app.use('/api/threat', threatRoutes); // Routes: /api/threat/analyze, /api/threat/logs

// ✅ Test root route
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// ✅ Optional test route
app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, title: 'Full Stack Portfolio', tech: 'React + Node.js + EC2' },
    { id: 2, title: 'API Service', tech: 'Express + PostgreSQL' }
  ]);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
