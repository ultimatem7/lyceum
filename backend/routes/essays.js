const express = require('express');
const router = express.Router();
const Essay = require('../models/Essay');
const Vote = require('../models/Vote');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const type = req.query.type;
    const sort = req.query.sort || '-createdAt';
    const query = { published: true };
    if (category && category !== 'All') query.category = category;
    if (type && type !== 'All') query.type = type;
    const essays = await Essay.find(query).populate('author', 'username avatar').sort(sort).limit(limit).skip((page - 1) * limit);
    const total = await Essay.countDocuments(query);
    res.json({ essays, currentPage: page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const essay = await Essay.findById(req.params.id).populate('author', 'username avatar bio favoritePhilosophers');
    if (!essay) {
      return res.status(404).json({ message: 'Essay not found' });
    }
    essay.views = (essay.views || 0) + 1;
    await essay.save();
    res.json(essay);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, type, category, published } = req.body;
    const essay = new Essay({ title, content, author: req.user, type, category, published: published !== undefined ? published : true });
    await essay.save();
    await essay.populate('author', 'username avatar');
    res.status(201).json(essay);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const existingVote = await Vote.findOne({ user: req.user, targetType: 'essay', targetId: req.params.id });
    const essay = await Essay.findById(req.params.id);
    if (!essay) {
      return res.status(404).json({ message: 'Essay not found' });
    }
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id });
        essay.votes -= voteType;
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
        essay.votes += voteType * 2;
      }
    } else {
      await Vote.create({ user: req.user, targetType: 'essay', targetId: req.params.id, voteType });
      essay.votes += voteType;
    }
    await essay.save();
    res.json({ votes: essay.votes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;