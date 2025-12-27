const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Essay = require('../models/Essay');
const User = require('../models/User');
const CommentReaction = require('../models/CommentReaction');
const auth = require('../middleware/auth');
const { sendCommentNotificationEmail } = require('../utils/email');

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
        const commentObj = comment.toObject();
        // Ensure insightful and notHelpful are included (they default to 0)
        if (!commentObj.insightful) commentObj.insightful = 0;
        if (!commentObj.notHelpful) commentObj.notHelpful = 0;
        // Add counts to replies as well
        const repliesWithCounts = replies.map(reply => {
          const replyObj = reply.toObject();
          if (!replyObj.insightful) replyObj.insightful = 0;
          if (!replyObj.notHelpful) replyObj.notHelpful = 0;
          return replyObj;
        });
        return { ...commentObj, replies: repliesWithCounts };
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
    await comment.populate('author', 'username avatar email');
    
    if (postId) {
      await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
      
      // Get post author to send notification
      const post = await Post.findById(postId).populate('author', 'email username');
      if (post && post.author && post.author._id.toString() !== req.user.userId.toString()) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const contentUrl = `${frontendUrl}/post/${postId}`;
        try {
          await sendCommentNotificationEmail(
            post.author.email,
            comment.author.username,
            post.title,
            content,
            false,
            null,
            contentUrl
          );
        } catch (emailError) {
          console.error('Error sending comment notification email:', emailError);
          // Don't fail the request if email fails
        }
      }
    }
    
    if (essayId) {
      await Essay.findByIdAndUpdate(essayId, { $inc: { commentCount: 1 } });
      
      // Get essay author to send notification
      const essay = await Essay.findById(essayId).populate('author', 'email username');
      if (essay && essay.author && essay.author._id.toString() !== req.user.userId.toString()) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const contentUrl = `${frontendUrl}/essay/${essayId}`;
        try {
          await sendCommentNotificationEmail(
            essay.author.email,
            comment.author.username,
            essay.title,
            content,
            false,
            null,
            contentUrl
          );
        } catch (emailError) {
          console.error('Error sending comment notification email:', emailError);
          // Don't fail the request if email fails
        }
      }
    }
    
    // If this is a reply to a comment, notify the parent comment author
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment).populate('author', 'email username');
      if (parentCommentDoc && parentCommentDoc.author && parentCommentDoc.author._id.toString() !== req.user.userId.toString()) {
        // Get the post or essay title
        let contentTitle = 'your comment';
        let contentUrl = '';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        
        if (postId) {
          const post = await Post.findById(postId);
          if (post) {
            contentTitle = post.title;
            contentUrl = `${frontendUrl}/post/${postId}`;
          }
        } else if (essayId) {
          const essay = await Essay.findById(essayId);
          if (essay) {
            contentTitle = essay.title;
            contentUrl = `${frontendUrl}/essay/${essayId}`;
          }
        }
        
        try {
          await sendCommentNotificationEmail(
            parentCommentDoc.author.email,
            comment.author.username,
            contentTitle,
            content,
            true,
            parentCommentDoc.author.username,
            contentUrl
          );
        } catch (emailError) {
          console.error('Error sending reply notification email:', emailError);
          // Don't fail the request if email fails
        }
      }
    }
    
    // Remove email from response before sending
    const commentResponse = comment.toObject();
    if (commentResponse.author && commentResponse.author.email) {
      delete commentResponse.author.email;
    }
    
    res.status(201).json(commentResponse);
  } catch (error) {
    console.error('Error creating comment:', error);
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
    
    const existingReaction = await CommentReaction.findOne({ 
      user: req.user.userId,
      commentId: req.params.id 
    });
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // Remove reaction if clicking the same reaction again
        await CommentReaction.deleteOne({ _id: existingReaction._id });
        comment[reactionType] -= 1;
      } else {
        // Switch reaction type
        const oldType = existingReaction.reactionType;
        existingReaction.reactionType = reactionType;
        await existingReaction.save();
        comment[oldType] -= 1;
        comment[reactionType] += 1;
      }
    } else {
      // New reaction
      await CommentReaction.create({ 
        user: req.user.userId,
        commentId: req.params.id, 
        reactionType 
      });
      comment[reactionType] += 1;
    }
    
    await comment.save();
    res.json({ 
      insightful: comment.insightful,
      notHelpful: comment.notHelpful
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
