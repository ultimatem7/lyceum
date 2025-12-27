const mongoose = require('mongoose');

const commentReactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  },
  reactionType: {
    type: String,
    enum: ['insightful', 'notHelpful'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

commentReactionSchema.index({ user: 1, commentId: 1 }, { unique: true });

module.exports = mongoose.model('CommentReaction', commentReactionSchema);

