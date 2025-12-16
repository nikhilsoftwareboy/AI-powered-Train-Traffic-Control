const express = require('express');
const router = express.Router();
const Train = require('../models/Train');
const Section = require('../models/Section');

// Get all trains
router.get('/', async (req, res) => {
  try {
    const trains = await Train.find()
      .populate('currentSection')
      .populate('nextSection')
      .sort({ createdAt: -1 });
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single train
router.get('/:id', async (req, res) => {
  try {
    const train = await Train.findById(req.params.id)
      .populate('currentSection')
      .populate('nextSection');
    if (!train) {
      return res.status(404).json({ error: 'Train not found' });
    }
    res.json(train);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create train
router.post('/', async (req, res) => {
  try {
    const train = new Train(req.body);
    await train.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('train:created', train);
    }
    
    res.status(201).json(train);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update train
router.put('/:id', async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('currentSection').populate('nextSection');
    
    if (!train) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('train:updated', train);
      if (train.currentSection) {
        io.to(`section-${train.currentSection._id}`).emit('section:updated', train);
      }
    }
    
    res.json(train);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete train
router.delete('/:id', async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (!train) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('train:deleted', { id: req.params.id });
    }
    
    res.json({ message: 'Train deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update train position
router.post('/:id/position', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const train = await Train.findByIdAndUpdate(
      req.params.id,
      { position: { latitude, longitude } },
      { new: true }
    ).populate('currentSection');
    
    if (!train) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    // Emit real-time position update
    const io = req.app.get('io');
    if (io) {
      io.emit('train:position', {
        trainId: train._id,
        position: train.position,
        sectionId: train.currentSection?._id
      });
    }
    
    res.json(train);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

