const express = require('express');
const router = express.Router();
const Train = require('../models/Train');
const Section = require('../models/Section');
const aiOptimizer = require('../services/aiOptimizer');

// Get overall system analytics
router.get('/dashboard', async (req, res) => {
  try {
    const trains = await Train.find().populate('currentSection');
    const sections = await Section.find().populate('currentTrains');
    
    const totalTrains = trains.length;
    const runningTrains = trains.filter(t => t.status === 'running').length;
    const delayedTrains = trains.filter(t => t.status === 'delayed').length;
    const totalDelay = trains.reduce((sum, t) => sum + (t.delay || 0), 0);
    const avgDelay = totalDelay / totalTrains || 0;
    
    const totalThroughput = sections.reduce((sum, s) => sum + (s.throughput || 0), 0);
    const totalPassengers = trains.reduce((sum, t) => sum + (t.passengers || 0), 0);
    
    const congestionData = sections.map(section => ({
      sectionId: section._id,
      sectionName: section.name,
      utilization: ((section.currentTrains?.length || 0) / section.maxCapacity) * 100,
      currentTrains: section.currentTrains?.length || 0,
      maxCapacity: section.maxCapacity,
      status: section.status
    }));
    
    const metrics = aiOptimizer.calculateMetrics(trains, sections);
    
    res.json({
      overview: {
        totalTrains,
        runningTrains,
        delayedTrains,
        avgDelay: Math.round(avgDelay),
        totalThroughput,
        totalPassengers,
        systemEfficiency: ((runningTrains / totalTrains) * 100) || 0
      },
      congestion: congestionData,
      metrics,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get time series data for charts
router.get('/timeseries', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const trains = await Train.find().populate('currentSection');
    const sections = await Section.find();
    
    // Generate time series data (in production, this would come from historical data)
    const timeSeries = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const totalTrains = trains.length;
      const runningTrains = trains.filter(t => t.status === 'running').length;
      const totalDelay = trains.reduce((sum, t) => sum + (t.delay || 0), 0);
      const totalThroughput = sections.reduce((sum, s) => sum + (s.throughput || 0), 0);
      
      timeSeries.push({
        timestamp,
        totalTrains,
        runningTrains,
        avgDelay: Math.round(totalDelay / totalTrains) || 0,
        throughput: totalThroughput
      });
    }
    
    res.json({ timeSeries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get section performance comparison
router.get('/sections/performance', async (req, res) => {
  try {
    const sections = await Section.find().populate('currentTrains');
    
    const performance = sections.map(section => ({
      sectionId: section._id,
      sectionName: section.name,
      throughput: section.throughput || 0,
      averageDelay: section.averageDelay || 0,
      utilization: ((section.currentTrains?.length || 0) / section.maxCapacity) * 100,
      efficiency: section.throughput > 0 
        ? (100 - (section.averageDelay / section.throughput)) 
        : 0,
      status: section.status,
      currentTrains: section.currentTrains?.length || 0,
      maxCapacity: section.maxCapacity
    }));
    
    // Sort by efficiency
    performance.sort((a, b) => b.efficiency - a.efficiency);
    
    res.json({ performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

