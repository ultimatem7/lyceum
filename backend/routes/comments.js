// backend/routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Essay = require('../models/Essay');
const Vote = require('../models/Vote');
const auth = require('../middleware/auth');

// ---------- GET COMMENTS (NESTED) ----------
router.get('/', async (req, res) => {
  try {
    const { postId, essayId } = req.query;
    const query = {};

    if (postId) query.postId = postId;
    if (essayId) query.essayId = essayId;

    // Get ALL comments for this post/essay
    const comments = await Comment.find(query)
      .populate('author', 'username avatar')
      .sort('createdAt');

    const nested = buildCommentTree(comments);
    res.json(nested);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------- CREATE COMMENT OR REPLY ----------
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId, essayId, parentComment } = req.body;

    if (!content || (!postId && !essayId)) {
      return res.status(400).json({ message: 'Content and postId or essayId are required' });
    }

    const comment = new Comment({
      content,
      author: req.user.userId, // from your auth middleware
      postId: postId || null,
      essayId: essayId || null,
      parentComment: parentComment || null
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

// ---------- VOTE ON COMMENT ----------
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;

    const existingVote = await Vote.findOne({
      user: req.user.userId,
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
        user: req.user.userId,
        targetType: 'comment',
        targetId: req.params.id,
        voteType
      });
      comment.votes += voteType;
    }

    await comment.save();
    res.json({ votes: comment.votes });
  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------- HELPER: BUILD NESTED TREE ----------
function buildCommentTree(comments) {
  const byId = {};
  comments.forEach((c) => {
    byId[c._id.toString()] = { ...c.toObject(), replies: [] };
  });

  const roots = [];

  comments.forEach((c) => {
    const id = c._id.toString();
    if (c.parentComment) {
      const parentId = c.parentComment.toString();
      if (byId[parentId]) {
        byId[parentId].replies.push(byId[id]);
      }
    } else {
      roots.push(byId[id]);
    }
  });

  return roots;
}

module.exports = router;
