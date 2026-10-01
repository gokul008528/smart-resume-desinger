require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { isConfigured, getModels } = require('./services/gemini');

const connectDB = require('./config/db');
const { initFirebaseAdmin } = require('./config/firebase');
const { generalLimiter } = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const resumeRoutes = require('./routes/resumes');
const aiRoutes = require('./routes/ai');
const atsRoutes = require('./routes/ats');
const templateRoutes = require('./routes/templates');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 5000;

// Security + parsing middleware
app.use(helmet({
  // Firebase Auth popup flow works without a restrictive COOP header.
  crossOriginOpenerPolicy: false,
}));
app.use(
  cors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '4mb' }));
app.use(morgan('dev'));
app.use('/api/', generalLimiter);


app.get('/api/config/public', (req, res) => res.json({
  success: true,
  githubRepositoryUrl: process.env.GITHUB_REPOSITORY_URL || '',
}));

app.get('/api/health', (req, res) => res.json({
  success: true,
  message: 'Smart Resume Designer API is running',
  environment: process.env.NODE_ENV || 'development',
  ai: { configured: isConfigured(), models: getModels() },
  firebase: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/public', publicRoutes);

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'API route not found.' });
});

// Central error handler — never leak stack traces to clients.
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    code: 'SERVER_ERROR',
    message: 'Something went wrong. Please try again.',
  });
});

// Optional production hosting: if the client is built into ../client/dist,
// Express serves it and falls back to index.html so BrowserRouter URLs work
// on direct refreshes in production.
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

async function start() {
  await connectDB();
  initFirebaseAdmin();
  app.listen(PORT, () => console.log(`[Server] Listening on port ${PORT}`));
}

start();

module.exports = app;
