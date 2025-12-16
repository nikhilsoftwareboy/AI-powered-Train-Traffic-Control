const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  startPoint: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  endPoint: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  length: {
    type: Number,
    required: true
  },
  maxCapacity: {
    type: Number,
    default: 3
  },
  currentTrains: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train'
  }],
  speedLimit: {
    type: Number,
    default: 120
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'congested', 'blocked'],
    default: 'operational'
  },
  throughput: {
    type: Number,
    default: 0
  },
  averageDelay: {
    type: Number,
    default: 0
  },
  connectedSections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Section', sectionSchema);

