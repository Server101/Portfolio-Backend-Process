require('dotenv').config();
const express = require('express'); 
const cors = require('cors');
const app = express();
const PORT = 3001;

// ✅ Middleware first
app.use(cors());
app.use(express.json());

// ✅ Routes
const iamScanRoute = require('./routes/iamScan');
// Remove this if you’re not using `routes/iam.js`
// const iamRoutes = require('./routes/iam');

// Use only the correct IAM route
app.use('/api/iam', iamScanRoute);

// ✅ Threat Monitoring Routes
const threatRoutes = require('./routes/threat'); 
app.use('/api/threat', threatRoutes);

// ✅ Root health check
app.get('/', (req, res) => {
  res.send('API is running ✅');
});

// ✅ Example route (optional)
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
