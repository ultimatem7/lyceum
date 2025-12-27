const express = require('express');
const router = express.Router();
const Essay = require('../models/Essay');
const EssayReaction = require('../models/EssayReaction');
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
    
    const essays = await Essay.find(query)
      .populate('author', 'username avatar')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Essay.countDocuments(query);
    
    res.json({ 
      essays, 
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
    const essay = await Essay.findById(req.params.id)
      .populate('author', 'username avatar bio favoritePhilosophers');
    
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
    
    const essay = new Essay({ 
      title, 
      content, 
      author: req.user.userId,  // ← Fixed: Use userId
      type, 
      category, 
      published: published !== undefined ? published : true 
    });
    
    await essay.save();
    await essay.populate('author', 'username avatar');
    
    res.status(201).json(essay);
  } catch (error) {
    console.error('Error creating essay:', error);
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
    
    const existingReaction = await EssayReaction.findOne({ 
      user: req.user.userId,
      essayId: req.params.id 
    });
    
    const essay = await Essay.findById(req.params.id);
    
    if (!essay) {
      return res.status(404).json({ message: 'Essay not found' });
    }
    
    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // Remove reaction if clicking the same reaction again
        await EssayReaction.deleteOne({ _id: existingReaction._id });
        essay[reactionType] -= 1;
      } else {
        // Switch reaction type
        const oldType = existingReaction.reactionType;
        existingReaction.reactionType = reactionType;
        await existingReaction.save();
        essay[oldType] -= 1;
        essay[reactionType] += 1;
      }
    } else {
      // New reaction
      await EssayReaction.create({ 
        user: req.user.userId,
        essayId: req.params.id, 
        reactionType 
      });
      essay[reactionType] += 1;
    }
    
    await essay.save();
    res.json({ 
      insightful: essay.insightful,
      notHelpful: essay.notHelpful
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
