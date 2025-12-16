const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const Train = require('../models/Train');

// Get all sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find()
      .populate('currentTrains')
      .populate('connectedSections');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single section
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('currentTrains')
      .populate('connectedSections');
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create section
router.post('/', async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('section:created', section);
    }
    
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update section
router.put('/:id', async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('currentTrains');
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`section-${section._id}`).emit('section:updated', section);
    }
    
    res.json(section);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get section statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('currentTrains');
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    const stats = {
      sectionId: section._id,
      sectionName: section.name,
      currentTrains: section.currentTrains?.length || 0,
      maxCapacity: section.maxCapacity,
      utilization: ((section.currentTrains?.length || 0) / section.maxCapacity) * 100,
      throughput: section.throughput || 0,
      averageDelay: section.averageDelay || 0,
      status: section.status,
      trains: section.currentTrains
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

