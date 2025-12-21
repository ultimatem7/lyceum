const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ---------- LOG EVERY REQUEST ----------
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------- CORS ----------
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://lyceum-theta.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- ROUTE DIAGNOSTIC ----------
console.log('🔍 === LOADING ROUTES ===');

const routes = [
  { name: 'auth', path: '/api/auth' },
  { name: 'posts', path: '/api/posts' },
  { name: 'essays', path: '/api/essays' },
  { name: 'comments', path: '/api/comments' },
  { name: 'users', path: '/api/users' },
  { name: 'profile', path: '/api/profile' }
];

for (const route of routes) {
  try {
    const routeModule = require(`./routes/${route.name}`);
    console.log(`✅ ${route.name}Routes loaded`);
    app.use(route.path, routeModule);
  } catch (e) {
    console.error(`❌ ${route.name}Routes FAILED:`, e.message);
  }
}
console.log('🔍 === ROUTES LOADED ===');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lyceum API running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🚨 ERROR:', err.stack);
  res.status(500).json({ error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('🚫 404:', req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

// Database
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
});
