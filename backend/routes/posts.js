const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const PostReaction = require('../models/PostReaction');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const sort = req.query.sort || '-createdAt';
    const query = category && category !== 'All' ? { category } : {};
    
    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments(query);
    
    res.json({ 
      posts, 
      currentPage: page, 
      totalPages: Math.ceil(total / limit), 
      total 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.views = (post.views || 0) + 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, type, category } = req.body;
    
    const post = new Post({ 
      title, 
      content, 
      author: req.user.userId,  // ← Fixed: Use userId from decoded token
      type, 
      category 
    });
    
    await post.save();
    await post.populate('author', 'username avatar');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.errors
    });
  }
});

router.post('/:id/reaction', auth, async (req, res) => {
  try {
    const { reactionType } = req.body; // 'insightful' or 'notHelpful'
    
    if (!['insightful', 'notHelpful'].includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type. Must be "insightful" or "notHelpful"' });
    }
    
    const existingReaction = await PostReaction.findOne({ 
      user: req.user.userId,
      postId: req.params.id 
    });
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // Remove reaction if clicking the same reaction again
        await PostReaction.deleteOne({ _id: existingReaction._id });
        post[reactionType] -= 1;
      } else {
        // Switch reaction type
        const oldType = existingReaction.reactionType;
        existingReaction.reactionType = reactionType;
        await existingReaction.save();
        post[oldType] -= 1;
        post[reactionType] += 1;
      }
    } else {
      // New reaction
      await PostReaction.create({ 
        user: req.user.userId,
        postId: req.params.id, 
        reactionType 
      });
      post[reactionType] += 1;
    }
    
    await post.save();
    res.json({ 
      insightful: post.insightful,
      notHelpful: post.notHelpful
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
