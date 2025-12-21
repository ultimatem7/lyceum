const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const essayRoutes = require('./routes/essays');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');

const app = express();

// ---------- RATE LIMITING ----------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// ---------- LOG EVERY REQUEST ----------
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------- CORS ----------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://lyceum-theta.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

// ---------- BODY PARSING ----------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- ROUTES ----------
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Lyceum API is running',
    timestamp: new Date().toISOString()
  });
});

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error('🚨 ERROR:', err.stack);
  console.error('🚨 URL:', req.originalUrl);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// ---------- 404 HANDLER ----------
app.use('*', (req, res) => {
  console.log('🚫 404:', req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

// ---------- DATABASE ----------
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ---------- SERVER START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🚀 Lyceum Backend Server Started');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log('\n📚 Ready for Reddit testers!\n');
});
