const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Profile fields
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  profilePicture: {
    type: String,
    default: '' // URL to uploaded image or empty for default
  },
  location: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  // Statistics
  totalViews: {
    type: Number,
    default: 0
  },
  totalUpvotes: {
    type: Number,
    default: 0
  },
  // Awards/Badges
  awards: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Activity tracking
  postsCount: {
    type: Number,
    default: 0
  },
  essaysCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  // Account info
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);