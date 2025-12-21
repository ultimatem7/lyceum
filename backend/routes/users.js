const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Essay = require('../models/Essay');
const auth = require('../middleware/auth');

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const posts = await Post.find({ author: user._id }).sort('-createdAt').limit(10);
    const essays = await Essay.find({ author: user._id, published: true }).sort('-createdAt').limit(10);
    const postCount = await Post.countDocuments({ author: user._id });
    const essayCount = await Essay.countDocuments({ author: user._id, published: true });
    res.json({
      user,
      posts,
      essays,
      stats: { postCount, essayCount, totalContent: postCount + essayCount }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, favoritePhilosophers, interests, avatar } = req.body;
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (bio !== undefined) user.bio = bio;
    if (favoritePhilosophers !== undefined) user.favoritePhilosophers = favoritePhilosophers;
    if (interests !== undefined) user.interests = interests;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        favoritePhilosophers: user.favoritePhilosophers,
        interests: user.interests,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;