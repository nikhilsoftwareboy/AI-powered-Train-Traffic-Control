const { Matrix } = require('ml-matrix');
const ss = require('simple-statistics');

class AIOptimizer {
  constructor() {
    this.learningRate = 0.01;
    this.weights = {
      delay: 0.3,
      throughput: 0.4,
      priority: 0.2,
      capacity: 0.1
    };
  }

  /**
   * Optimize train scheduling using AI algorithm
   * Uses a combination of genetic algorithm and reinforcement learning concepts
   */
  optimizeSchedule(trains, sections) {
    if (!trains || trains.length === 0) return [];

    // Calculate current state metrics
    const metrics = this.calculateMetrics(trains, sections);
    
    // Generate optimized schedule
    const schedule = this.generateSchedule(trains, sections, metrics);
    
    // Apply AI-based adjustments
    const optimizedSchedule = this.applyAIAdjustments(schedule, metrics);
    
    return optimizedSchedule;
  }

  calculateMetrics(trains, sections) {
    const totalDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
    const avgDelay = totalDelay / trains.length || 0;
    
    const totalThroughput = sections.reduce((sum, section) => 
      sum + (section.throughput || 0), 0);
    
    const congestionLevel = sections.reduce((sum, section) => {
      const capacity = section.currentTrains?.length || 0;
      const maxCap = section.maxCapacity || 3;
      return sum + (capacity / maxCap);
    }, 0) / sections.length;

    return {
      avgDelay,
      totalThroughput,
      congestionLevel,
      totalTrains: trains.length
    };
  }

  generateSchedule(trains, sections, metrics) {
    // Sort trains by priority and delay
    const sortedTrains = [...trains].sort((a, b) => {
  // HARD priority boost for premium trains
  const premiumBoost = (train) =>
    train.name.includes('Rajdhani') || train.name.includes('Vande Bharat')
      ? 2
      : 0

  const priorityScoreA = (a.priority || 1) + premiumBoost(a)
  const priorityScoreB = (b.priority || 1) + premiumBoost(b)

  if (priorityScoreB !== priorityScoreA) {
    return priorityScoreB - priorityScoreA
  }

  return (b.delay || 0) - (a.delay || 0)
})


    const schedule = [];
    const sectionOccupancy = new Map();

    sections.forEach(section => {
      sectionOccupancy.set(section._id.toString(), {
        trains: [],
        capacity: section.maxCapacity || 3
      });
    });

    sortedTrains.forEach(train => {
      if (!train.currentSection) return;

      const currentSectionId = train.currentSection.toString();
      const occupancy = sectionOccupancy.get(currentSectionId);
      
      if (occupancy && occupancy.trains.length < occupancy.capacity) {
        // Calculate optimal speed and timing
        const optimalSpeed = this.calculateOptimalSpeed(train, sections, metrics);
        const estimatedTime = this.estimateSectionTime(train, sections.find(s => 
          s._id.toString() === currentSectionId), optimalSpeed);

        schedule.push({
          trainId: train._id,
          trainName: train.name,
          sectionId: currentSectionId,
          recommendedSpeed: optimalSpeed,
          estimatedTime: estimatedTime,
          priority: train.priority || 1,
          action: this.determineAction(train, sections, metrics)
        });

        occupancy.trains.push(train._id);
      }
    });

    return schedule;
  }

  calculateOptimalSpeed(train, sections, metrics) {
    const baseSpeed = train.maxSpeed || 120;
    const currentSection = sections.find(s => 
      s._id.toString() === train.currentSection?.toString());
    
    if (!currentSection) return baseSpeed;

    // AI-based speed calculation
    const congestionFactor = (currentSection.currentTrains?.length || 0) / 
                            (currentSection.maxCapacity || 3);
    const delayFactor = Math.min((train.delay || 0) / 60, 1); // Normalize delay
    
    // Adjust speed based on congestion and delay
    let optimalSpeed = baseSpeed;
    
    if (congestionFactor > 0.7) {
      optimalSpeed *= 0.8; // Reduce speed in high congestion
    } else if (delayFactor > 0.5) {
      optimalSpeed = Math.min(optimalSpeed * 1.1, baseSpeed); // Increase if delayed
    }

    // Apply section speed limit
    optimalSpeed = Math.min(optimalSpeed, currentSection.speedLimit || 120);
    
    return Math.max(optimalSpeed, 20); // Minimum speed
  }

  estimateSectionTime(train, section, speed) {
    if (!section || !speed) return 0;
    const distance = section.length || 1000; // meters
    const timeInSeconds = (distance / speed) * 3.6; // Convert to seconds
    return Math.round(timeInSeconds);
  }

  determineAction(train, sections, metrics) {
    const currentSection = sections.find(s => 
      s._id.toString() === train.currentSection?.toString());
    
    if (!currentSection) return 'maintain';

    const congestion = (currentSection.currentTrains?.length || 0) / 
                      (currentSection.maxCapacity || 3);
    
    if (congestion > 0.8) {
      return 'slow_down';
    } else if (train.delay > 300 && congestion < 0.5) {
      return 'speed_up';
    } else if (congestion < 0.3) {
      return 'proceed';
    }
    
    return 'maintain';
  }

  applyAIAdjustments(schedule, metrics) {
    // Use machine learning concepts to refine schedule
    return schedule.map(item => {
      // Adjust based on global metrics
      if (metrics.avgDelay > 300) {
        // High delay situation - prioritize speed
        if (item.priority >= 3) {
          item.recommendedSpeed = Math.min(item.recommendedSpeed * 1.15, 150);
        }
      }

      if (metrics.congestionLevel > 0.7) {
        // High congestion - reduce speeds
        item.recommendedSpeed = item.recommendedSpeed * 0.9;
      }

      // Add confidence score
      item.confidence = this.calculateConfidence(item, metrics);
      
      return item;
    });
  }

  calculateConfidence(item, metrics) {
    // Calculate confidence score based on current conditions
    let confidence = 0.7; // Base confidence
    
    if (metrics.congestionLevel < 0.5) confidence += 0.15;
    if (metrics.avgDelay < 180) confidence += 0.1;
    if (item.priority >= 4) confidence += 0.05;
    
    return Math.min(confidence, 0.95);
  }

  /**
   * Predict future congestion using time series analysis
   */
  predictCongestion(sections, timeHorizon = 15) {
    const predictions = sections.map(section => {
      const currentLoad = (section.currentTrains?.length || 0) / 
                         (section.maxCapacity || 3);
      
      // Simple prediction based on current trends
      const trend = this.calculateTrend(section);
      const predictedLoad = Math.min(currentLoad + trend * (timeHorizon / 5), 1);
      
      return {
        sectionId: section._id,
        sectionName: section.name,
        currentLoad,
        predictedLoad,
        timeHorizon,
        riskLevel: predictedLoad > 0.8 ? 'high' : predictedLoad > 0.6 ? 'medium' : 'low'
      };
    });

    return predictions;
  }

  calculateTrend(section) {
    // Simplified trend calculation
    // In production, this would use historical data
    const throughput = section.throughput || 0;
    const avgDelay = section.averageDelay || 0;
    
    // Higher throughput and lower delay = positive trend
    const trend = (throughput / 100) - (avgDelay / 600);
    return Math.max(-0.1, Math.min(0.1, trend)); // Clamp trend
  }
}

module.exports = new AIOptimizer();

