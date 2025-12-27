const mongoose = require('mongoose');

const postReactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
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

postReactionSchema.index({ user: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('PostReaction', postReactionSchema);

