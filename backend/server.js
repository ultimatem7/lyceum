// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const essayRoutes = require('./routes/essays');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
// const uploadRoutes = require('./routes/upload'); // if you created upload routes

const app = express();

// ---------- CORS CONFIG ----------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://lyceum-theta.vercel.app' // your Vercel URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman (no origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Preflight handler
app.options('*', cors());

// ---------- BODY PARSING ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- STATIC UPLOADS (optional) ----------
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
// app.use('/api/upload', uploadRoutes); // if you have upload.js

// ---------- ERROR HANDLING (ADD THIS) ----------
app.use((err, req, res, next) => {
  console.error('🚨 ERROR:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lyceum API is running',
    endpoints: {
      auth: '/api/auth (register, login, google)',
      posts: '/api/posts',
      essays: '/api/essays',
      comments: '/api/comments',
      users: '/api/users'
    }
  });
});

// ---------- DATABASE ----------
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ---------- SERVER START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 Lyceum Backend Server Started');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log('\n📚 Ready to accept requests!\n');
});
