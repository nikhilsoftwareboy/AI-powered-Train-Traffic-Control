const express = require('express');
const router = express.Router();
const Train = require('../models/Train');
const Section = require('../models/Section');
const aiOptimizer = require('../services/aiOptimizer');

// Get AI-optimized schedule
router.post('/schedule', async (req, res) => {
  try {
    const trains = await Train.find()
      .populate('currentSection')
      .populate('nextSection');
    
    const sections = await Section.find()
      .populate('currentTrains');
    
    const optimizedSchedule = aiOptimizer.optimizeSchedule(trains, sections);
    
    // Emit optimization results
    const io = req.app.get('io');
    if (io) {
      io.emit('optimization:updated', optimizedSchedule);
    }
    
    res.json({
      schedule: optimizedSchedule,
      timestamp: new Date(),
      totalTrains: trains.length,
      totalSections: sections.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get congestion predictions
router.get('/predictions', async (req, res) => {
  try {
    const sections = await Section.find().populate('currentTrains');
    const timeHorizon = parseInt(req.query.horizon) || 15; // minutes
    
    const predictions = aiOptimizer.predictCongestion(sections, timeHorizon);
    
    res.json({
      predictions,
      timeHorizon,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply optimization recommendations
router.post('/apply', async (req, res) => {
  try {
    const { recommendations } = req.body;
    
    if (!Array.isArray(recommendations)) {
      return res.status(400).json({ error: 'Recommendations must be an array' });
    }
    
    const updates = [];
    
    for (const rec of recommendations) {
      if (rec.trainId && rec.recommendedSpeed) {
        const train = await Train.findByIdAndUpdate(
          rec.trainId,
          { speed: rec.recommendedSpeed },
          { new: true }
        );
        
        if (train) {
          updates.push(train);
          
          // Emit real-time update
          const io = req.app.get('io');
          if (io) {
            io.emit('train:optimized', {
              trainId: train._id,
              speed: train.speed,
              action: rec.action
            });
          }
        }
      }
    }
    
    res.json({
      message: 'Optimization applied successfully',
      updatedTrains: updates.length,
      updates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

