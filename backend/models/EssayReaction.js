const mongoose = require('mongoose');

const essayReactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  essayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Essay',
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

essayReactionSchema.index({ user: 1, essayId: 1 }, { unique: true });

module.exports = mongoose.model('EssayReaction', essayReactionSchema);

