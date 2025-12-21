const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Essay = require('../models/Essay');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email'); // Don't send password or email

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id })
      .sort('-createdAt')
      .limit(10)
      .populate('author', 'username');

    // Get user's essays
    const essays = await Essay.find({ author: user._id })
      .sort('-createdAt')
      .limit(10)
      .populate('author', 'username');

    // Get user's recent comments
    const comments = await Comment.find({ author: user._id })
      .sort('-createdAt')
      .limit(10)
      .populate('author', 'username')
      .populate('postId', 'title');

    res.json({
      user,
      posts,
      essays,
      comments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile (authenticated user only)
router.put('/update', auth, async (req, res) => {
  try {
    const { bio, location, interests, profilePicture } = req.body;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (interests !== undefined) updateData.interests = interests;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user statistics
router.get('/:username/stats', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total views from all posts and essays
    const postViews = await Post.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const essayViews = await Essay.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    // Calculate total upvotes
    const postUpvotes = await Post.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$votes' } } }
    ]);

    const essayUpvotes = await Essay.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$votes' } } }
    ]);

    const totalViews = (postViews[0]?.total || 0) + (essayViews[0]?.total || 0);
    const totalUpvotes = (postUpvotes[0]?.total || 0) + (essayUpvotes[0]?.total || 0);

    // Update user stats
    await User.findByIdAndUpdate(user._id, {
      totalViews,
      totalUpvotes
    });

    res.json({
      totalViews,
      totalUpvotes,
      postsCount: user.postsCount,
      essaysCount: user.essaysCount,
      commentsCount: user.commentsCount,
      awards: user.awards
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Award a badge to user (admin feature - can be expanded)
router.post('/:username/award', auth, async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.awards.push({
      name,
      description,
      icon,
      earnedAt: new Date()
    });

    await user.save();
    res.json(user.awards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;