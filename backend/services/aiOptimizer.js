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

  /* ==============================
     MAIN OPTIMIZATION ENTRY POINT
  ============================== */
  optimizeSchedule(trains, sections) {
    if (!trains || trains.length === 0) return [];

    const metrics = this.calculateMetrics(trains, sections);
    const schedule = this.generateSchedule(trains, sections, metrics);
    const optimizedSchedule = this.applyAIAdjustments(schedule, metrics);

    return optimizedSchedule;
  }

  /* ==============================
     METRICS
  ============================== */
  calculateMetrics(trains, sections) {
    const totalDelay = trains.reduce((sum, train) => sum + (train.delay || 0), 0);
    const avgDelay = totalDelay / trains.length || 0;

    const totalThroughput = sections.reduce(
      (sum, section) => sum + (section.throughput || 0),
      0
    );

    const congestionLevel =
      sections.reduce((sum, section) => {
        const current = section.currentTrains?.length || 0;
        const max = section.maxCapacity || 3;
        return sum + current / max;
      }, 0) / sections.length;

    return {
      avgDelay,
      totalThroughput,
      congestionLevel,
      totalTrains: trains.length
    };
  }

  /* ==============================
     CORE SCHEDULING LOGIC (FIXED)
  ============================== */
  generateSchedule(trains, sections, metrics) {
    const sortedTrains = [...trains].sort((a, b) => {
      const premiumBoost = (train) =>
        train.name?.includes('Rajdhani') || train.name?.includes('Vande Bharat')
          ? 2
          : 0;

      const scoreA = (a.priority || 1) + premiumBoost(a);
      const scoreB = (b.priority || 1) + premiumBoost(b);

      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.delay || 0) - (a.delay || 0);
    });

    const schedule = [];
    const sectionOccupancy = new Map();

    sections.forEach((section) => {
      sectionOccupancy.set(section._id.toString(), {
        trains: [],
        capacity: section.maxCapacity || 3
      });
    });

    sortedTrains.forEach((train) => {
      if (!train.currentSection) return;

      // ✅ FIX: HANDLE POPULATED OBJECT OR ID
      const currentSectionId =
        typeof train.currentSection === 'object'
          ? train.currentSection._id.toString()
          : train.currentSection.toString();

      const occupancy = sectionOccupancy.get(currentSectionId);
      if (!occupancy || occupancy.trains.length >= occupancy.capacity) return;

      const currentSection = sections.find(
        (s) => s._id.toString() === currentSectionId
      );
      if (!currentSection) return;

      const optimalSpeed = this.calculateOptimalSpeed(train, sections, metrics);
      const estimatedTime = this.estimateSectionTime(
        train,
        currentSection,
        optimalSpeed
      );

      schedule.push({
        trainId: train._id,
        trainName: train.name,
        sectionId: currentSectionId,
        recommendedSpeed: optimalSpeed,
        estimatedTime,
        priority: train.priority || 1,
        action: this.determineAction(train, sections, metrics)
      });

      occupancy.trains.push(train._id);
    });

    return schedule;
  }

  /* ==============================
     SPEED CALCULATION (FIXED)
  ============================== */
  calculateOptimalSpeed(train, sections, metrics) {
    const baseSpeed = train.maxSpeed || 120;

    const sectionId =
      typeof train.currentSection === 'object'
        ? train.currentSection._id.toString()
        : train.currentSection?.toString();

    const currentSection = sections.find(
      (s) => s._id.toString() === sectionId
    );

    if (!currentSection) return baseSpeed;

    const congestion =
      (currentSection.currentTrains?.length || 0) /
      (currentSection.maxCapacity || 3);

    const delayFactor = Math.min((train.delay || 0) / 60, 1);

    let speed = baseSpeed;

    if (congestion > 0.7) speed *= 0.8;
    else if (delayFactor > 0.5) speed *= 1.1;

    speed = Math.min(speed, currentSection.speedLimit || 120);
    return Math.max(speed, 20);
  }

  /* ==============================
     TIME ESTIMATION
  ============================== */
  estimateSectionTime(train, section, speed) {
    if (!section || !speed) return 0;
    const distance = section.length || 1000;
    return Math.round((distance / speed) * 3.6);
  }

  /* ==============================
     ACTION DECISION (FIXED)
  ============================== */
  determineAction(train, sections, metrics) {
    const sectionId =
      typeof train.currentSection === 'object'
        ? train.currentSection._id.toString()
        : train.currentSection?.toString();

    const section = sections.find(
      (s) => s._id.toString() === sectionId
    );
    if (!section) return 'maintain';

    const congestion =
      (section.currentTrains?.length || 0) /
      (section.maxCapacity || 3);

    if (congestion > 0.8) return 'slow_down';
    if (train.delay > 300 && congestion < 0.5) return 'speed_up';
    if (congestion < 0.3) return 'proceed';

    return 'maintain';
  }

  /* ==============================
     AI REFINEMENT
  ============================== */
  applyAIAdjustments(schedule, metrics) {
    return schedule.map((item) => {
      if (metrics.avgDelay > 300 && item.priority >= 3) {
        item.recommendedSpeed = Math.min(item.recommendedSpeed * 1.15, 150);
      }

      if (metrics.congestionLevel > 0.7) {
        item.recommendedSpeed *= 0.9;
      }

      item.confidence = this.calculateConfidence(item, metrics);
      return item;
    });
  }

  calculateConfidence(item, metrics) {
    let confidence = 0.7;
    if (metrics.congestionLevel < 0.5) confidence += 0.15;
    if (metrics.avgDelay < 180) confidence += 0.1;
    if (item.priority >= 4) confidence += 0.05;
    return Math.min(confidence, 0.95);
  }

  /* ==============================
     CONGESTION PREDICTION
  ============================== */
  predictCongestion(sections, timeHorizon = 15) {
    return sections.map((section) => {
      const currentLoad =
        (section.currentTrains?.length || 0) /
        (section.maxCapacity || 3);

      const trend = this.calculateTrend(section);
      const predictedLoad = Math.min(
        currentLoad + trend * (timeHorizon / 5),
        1
      );

      return {
        sectionId: section._id,
        sectionName: section.name,
        currentLoad,
        predictedLoad,
        timeHorizon,
        riskLevel:
          predictedLoad > 0.8
            ? 'high'
            : predictedLoad > 0.6
            ? 'medium'
            : 'low'
      };
    });
  }

  calculateTrend(section) {
    const throughput = section.throughput || 0;
    const avgDelay = section.averageDelay || 0;
    const trend = throughput / 100 - avgDelay / 600;
    return Math.max(-0.1, Math.min(0.1, trend));
  }
}

module.exports = new AIOptimizer();
