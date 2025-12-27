const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['question', 'discussion'],
    default: 'discussion'
  },
  category: {
    type: String,
    enum: ['Ethics', 'Metaphysics', 'Epistemology', 'Political Philosophy', 'Philosophy of Mind', 
           'Philosophy of Religion', 'Aesthetics', 'Logic', 'Eastern Philosophy', 'Other'],
    default: 'Other'
  },
  insightful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);