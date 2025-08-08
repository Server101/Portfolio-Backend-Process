require('dotenv').config();
console.log("[DEBUG] Gemini API Key Loaded:", !!process.env.GEMINI_API_KEY);

const express = require('express'); 
const cors = require('cors');

const app = express();
const PORT = 3001;

// ✅ Middleware should come BEFORE routes
app.use(cors());
app.use(express.json());

// ✅ Routes
const iamLogRoutes = require('./routes/iamLogs');
const iamScanRoute = require('./routes/iamScan');
const threatRoutes = require('./routes/threat');

// ⬇️ NEW: Contact route
const contactRoutes = require('./routes/contact');

// Mount
app.use('/api/iam', iamLogRoutes);
app.use('/api/iam', iamScanRoute);
app.use('/api/threat', threatRoutes);

// ⬇️ Mount the contact route at /api/contact
app.use('/api/contact', contactRoutes);

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
