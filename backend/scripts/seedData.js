const mongoose = require('mongoose')
const Train = require('../models/Train')
const Section = require('../models/Section')
require('dotenv').config()

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/train-control', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')

    // Clear existing data
    await Train.deleteMany({})
    await Section.deleteMany({})
    console.log('Cleared existing data')

    // Create sections
    const sections = await Section.insertMany([
      {
        sectionId: 'SEC-001',
        name: 'North-South Main Line',
        startPoint: { latitude: 28.6139, longitude: 77.2090 },
        endPoint: { latitude: 28.7041, longitude: 77.1025 },
        length: 15000,
        maxCapacity: 4,
        speedLimit: 120,
        status: 'operational',
        throughput: 45,
        averageDelay: 120
      },
      {
        sectionId: 'SEC-002',
        name: 'East-West Corridor',
        startPoint: { latitude: 28.7041, longitude: 77.1025 },
        endPoint: { latitude: 28.5355, longitude: 77.3910 },
        length: 18000,
        maxCapacity: 3,
        speedLimit: 100,
        status: 'operational',
        throughput: 38,
        averageDelay: 180
      },
      {
        sectionId: 'SEC-003',
        name: 'Central Expressway',
        startPoint: { latitude: 28.5355, longitude: 77.3910 },
        endPoint: { latitude: 28.6139, longitude: 77.2090 },
        length: 12000,
        maxCapacity: 5,
        speedLimit: 140,
        status: 'operational',
        throughput: 52,
        averageDelay: 90
      },
      {
        sectionId: 'SEC-004',
        name: 'Metro Link',
        startPoint: { latitude: 28.6139, longitude: 77.2090 },
        endPoint: { latitude: 28.4595, longitude: 77.0266 },
        length: 20000,
        maxCapacity: 3,
        speedLimit: 80,
        status: 'congested',
        throughput: 28,
        averageDelay: 240
      }
    ])

    console.log(`Created ${sections.length} sections`)

    // Create trains (REAL INDIAN TRAINS)
const trains = await Train.insertMany([
  {
    trainId: 'TRN-001',
    name: 'Vande Bharat Express',
    currentSection: sections[0]._id,
    nextSection: sections[1]._id,
    speed: 110,
    maxSpeed: 160,
    position: { latitude: 28.6139, longitude: 77.2090 }, // New Delhi
    status: 'running',
    priority: 5,
    passengers: 600,
    delay: 0
  },
  {
    trainId: 'TRN-002',
    name: 'Rajdhani Express',
    currentSection: sections[1]._id,
    nextSection: sections[2]._id,
    speed: 100,
    maxSpeed: 130,
    position: { latitude: 28.7041, longitude: 77.1025 },
    status: 'running',
    priority: 5,
    passengers: 900,
    delay: 0
  },
  {
    trainId: 'TRN-003',
    name: 'Amritsar Shatabdi Express',
    currentSection: sections[2]._id,
    nextSection: sections[3]._id,
    speed: 95,
    maxSpeed: 130,
    position: { latitude: 28.5355, longitude: 77.3910 },
    status: 'running',
    priority: 4,
    passengers: 750,
    delay: 45
  },
  {
    trainId: 'TRN-004',
    name: 'Shaane Punjab Express',
    currentSection: sections[3]._id,
    nextSection: sections[0]._id,
    speed: 90,
    maxSpeed: 110,
    position: { latitude: 28.4595, longitude: 77.0266 },
    status: 'running',
    priority: 3,
    passengers: 820,
    delay: 60
  },
  {
    trainId: 'TRN-005',
    name: 'Amritsar Intercity Express',
    currentSection: sections[0]._id,
    nextSection: sections[1]._id,
    speed: 85,
    maxSpeed: 110,
    position: { latitude: 31.6340, longitude: 74.8723 }, // Amritsar
    status: 'running',
    priority: 3,
    passengers: 500,
    delay: 90
  }
])


    console.log(`Created ${trains.length} trains`)

    // Update sections with current trains
    await Section.findByIdAndUpdate(sections[0]._id, {
      currentTrains: [trains[0]._id, trains[4]._id]
    })
    await Section.findByIdAndUpdate(sections[1]._id, {
      currentTrains: [trains[1]._id]
    })
    await Section.findByIdAndUpdate(sections[2]._id, {
      currentTrains: [trains[3]._id]
    })
    await Section.findByIdAndUpdate(sections[3]._id, {
      currentTrains: [trains[2]._id]
    })

    console.log('Seed data created successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding data:', error)
    process.exit(1)
  }
}

seedData()

