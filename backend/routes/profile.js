const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Essay = require('../models/Essay');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const CommentReaction = require('../models/CommentReaction');
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

    // Use req.user.userId from auth middleware, NOT username from params
    const user = await User.findByIdAndUpdate(
      req.user.userId,  // ← From JWT token
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
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

    // Calculate total lightbulbs
    const postLightbulbs = await Post.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$lightbulbs' } } }
    ]);

    const essayLightbulbs = await Essay.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$lightbulbs' } } }
    ]);

    const totalViews = (postViews[0]?.total || 0) + (essayViews[0]?.total || 0);
    const totalLightbulbs = (postLightbulbs[0]?.total || 0) + (essayLightbulbs[0]?.total || 0);

    // Update user stats (keep totalUpvotes for backward compatibility but use lightbulbs)
    await User.findByIdAndUpdate(user._id, {
      totalViews,
      totalUpvotes: totalLightbulbs
    });

    res.json({
      totalViews,
      totalUpvotes: totalLightbulbs,
      totalLightbulbs,
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

// Delete account (authenticated user only - deletes their own account)
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user to verify they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete all user's votes
    await Vote.deleteMany({ user: userId });
    
    // Delete all user's comment reactions
    await CommentReaction.deleteMany({ user: userId });
    
    // Delete all user's comments
    await Comment.deleteMany({ author: userId });
    
    // Delete all user's posts
    await Post.deleteMany({ author: userId });
    
    // Delete all user's essays
    await Essay.deleteMany({ author: userId });
    
    // Finally, delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

module.exports = router;
