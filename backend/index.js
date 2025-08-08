// backend/index.js
require('dotenv').config();
console.log("[DEBUG] Gemini API Key Loaded:", !!process.env.GEMINI_API_KEY);

// Log email envs so we can see them in pm2 logs
console.log("[DEBUG] Email env present:",
  "REGION:", process.env.AWS_REGION,
  "FROM:", process.env.SES_FROM,
  "TO:", process.env.CONTACT_TO
);

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Middleware FIRST
app.use(cors());
app.use(express.json());

// ✅ Routes
const iamLogRoutes = require('./routes/iamLogs');
app.use('/api/iam', iamLogRoutes);

const iamScanRoute = require('./routes/iamScan');
app.use('/api/iam', iamScanRoute);

// 👉 Contact route
const contactRoute = require('./routes/contact');
app.use('/api/contact', contactRoute);

// ✅ Health check
app.get('/', (_, res) => res.send('API is running ✅'));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
