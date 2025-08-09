// backend/index.js
require('dotenv').config();
console.log("[DEBUG] Gemini API Key Loaded:", !!process.env.GEMINI_API_KEY);

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware (must come before routes)
app.set('trust proxy', true); // get real client IP behind nginx
app.use(cors());              // you can restrict origin later if needed
app.use(express.json({ limit: '1mb' }));

// --- Routes
const iamLogRoutes  = require('./routes/iamLogs');
const iamScanRoute  = require('./routes/iamScan');
const threatRoutes  = require('./routes/threat');
const contactRoutes = require('./routes/contact');

app.use('/api/iam', iamLogRoutes);     // GET /api/iam/logs
app.use('/api/iam', iamScanRoute);     // GET /api/iam/scan
app.use('/api/threat', threatRoutes);  // GET /api/threat/logs, POST /api/threat/analyze
app.use('/api/contact', contactRoutes);// POST /api/contact, GET /api/contact/logs

// --- Health check
app.get('/', (_req, res) => res.send('API is running ✅'));

// --- 404 for unknown API routes (helps debugging)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: `No route for ${req.method} ${req.path}` });
  }
  next();
});

// --- Error handler
// If any route throws, you'll see a clean JSON error instead of HTML.
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, error: 'Internal Server Error' });
});

// --- Start server
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log('Routes mounted: /api/iam, /api/threat, /api/contact');
});
