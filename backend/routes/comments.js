const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Essay = require('../models/Essay');
const Vote = require('../models/Vote');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { postId, essayId } = req.query;
    const query = {};
    
    if (postId) query.postId = postId;
    if (essayId) query.essayId = essayId;
    query.parentComment = null;
    
    const comments = await Comment.find(query)
      .populate('author', 'username avatar')
      .sort('-createdAt');
    
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'username avatar')
          .sort('createdAt');
        return { ...comment.toObject(), replies };
      })
    );
    
    res.json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { content, postId, essayId, parentComment } = req.body;
    
    const comment = new Comment({ 
      content, 
      author: req.user.userId,  // ← Fixed: Use userId
      postId, 
      essayId, 
      parentComment 
    });
    
    await comment.save();
    await comment.populate('author', 'username avatar');
    
    if (postId) {
      await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    }
    if (essayId) {
      await Essay.findByIdAndUpdate(essayId, { $inc: { commentCount: 1 } });
    }
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
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
      targetType: 'comment', 
      targetId: req.params.id 
    });
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id });
        comment.votes -= voteType;
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
        comment.votes += voteType * 2;
      }
    } else {
      await Vote.create({ 
        user: req.user.userId,  // ← Fixed: Use userId
        targetType: 'comment', 
        targetId: req.params.id, 
        voteType 
      });
      comment.votes += voteType;
    }
    
    await comment.save();
    res.json({ votes: comment.votes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
