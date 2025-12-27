const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // ADD THIS
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/email'); // ADD THIS

// Register
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password will be hashed by pre-save hook)
    user = new User({ 
      username, 
      email, 
      password  // Pass plain password - User model will hash it
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user has a password (vs OAuth login)
    if (!user.password) {
      return res.status(400).json({ message: 'Please login with Google' });
    }

    // Compare password using User model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google OAuth login (optional - for future use)
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    // Find existing user by Google ID or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user from Google data
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      user = new User({ 
        username, 
        email, 
        googleId, 
        profilePicture: picture || '' 
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== PASSWORD RESET ROUTES (ADD THESE) ==========

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Capture original email before normalization
    const originalEmail = req.body.email;
    
    // Normalize email for database lookup (lowercase and trim)
    // Note: We don't use normalizeEmail() here to preserve dots in Gmail addresses
    // but we still need to match what's in the database
    const emailForLookup = originalEmail.toLowerCase().trim();
    
    // Try to find user by the lookup email
    let user = await User.findOne({ email: emailForLookup });
    
    // If not found, try with dots removed (in case user registered with normalized email)
    if (!user && emailForLookup.includes('@gmail.com')) {
      const emailWithoutDots = emailForLookup.replace(/\./g, '');
      user = await User.findOne({ 
        $or: [
          { email: emailForLookup },
          { email: emailWithoutDots }
        ]
      });
    }
    
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({ 
        message: 'If that email exists, a reset link has been sent.' 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before saving to database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Save hashed token and expiry to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // Send email to the original email format provided by user (preserves dots)
    await sendPasswordResetEmail(originalEmail, resetToken);
    
    res.json({ 
      message: 'If that email exists, a reset link has been sent.' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Error sending reset email',
      error: error.message 
    });
  }
});

// Verify reset token (optional - for checking if token is valid)
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }
    
    res.json({ message: 'Token is valid' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error verifying token',
      error: error.message 
    });
  }
});

// Reset password with token
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }
    
    // Update password (will be hashed by pre-save hook)
    user.password = password;
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.json({ message: 'Password reset successful! You can now login.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Error resetting password',
      error: error.message 
    });
  }
});

module.exports = router;
