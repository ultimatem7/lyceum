const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Vote = require('../models/Vote');
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

router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    
    const existingVote = await Vote.findOne({ 
      user: req.user.userId,  // ← Fixed: Use userId
      targetType: 'post', 
      targetId: req.params.id 
    });
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id });
        post.lightbulbs -= voteType;
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
        post.lightbulbs += voteType * 2;
      }
    } else {
      await Vote.create({ 
        user: req.user.userId,  // ← Fixed: Use userId
        targetType: 'post', 
        targetId: req.params.id, 
        voteType 
      });
      post.lightbulbs += voteType;
    }
    
    await post.save();
    res.json({ lightbulbs: post.lightbulbs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
