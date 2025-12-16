const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  currentSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  nextSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  speed: {
    type: Number,
    default: 0,
    min: 0,
    max: 200
  },
  maxSpeed: {
    type: Number,
    default: 120
  },
  position: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'delayed', 'maintenance'],
    default: 'running'
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  scheduledArrival: {
    type: Date
  },
  estimatedArrival: {
    type: Date
  },
  delay: {
    type: Number,
    default: 0
  },
  passengers: {
    type: Number,
    default: 0
  },
  route: [{
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    order: Number,
    estimatedTime: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Train', trainSchema);

