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

    // Create trains
    const trains = await Train.insertMany([
      {
        trainId: 'TRN-001',
        name: 'Express Alpha',
        currentSection: sections[0]._id,
        nextSection: sections[1]._id,
        speed: 95,
        maxSpeed: 120,
        position: { latitude: 28.6500, longitude: 77.1800 },
        status: 'running',
        priority: 5,
        passengers: 850,
        delay: 0,
        scheduledArrival: new Date(Date.now() + 3600000),
        estimatedArrival: new Date(Date.now() + 3600000)
      },
      {
        trainId: 'TRN-002',
        name: 'Rapid Beta',
        currentSection: sections[1]._id,
        nextSection: sections[2]._id,
        speed: 88,
        maxSpeed: 100,
        position: { latitude: 28.6200, longitude: 77.2500 },
        status: 'running',
        priority: 4,
        passengers: 720,
        delay: 45,
        scheduledArrival: new Date(Date.now() + 2700000),
        estimatedArrival: new Date(Date.now() + 2745000)
      },
      {
        trainId: 'TRN-003',
        name: 'Metro Gamma',
        currentSection: sections[3]._id,
        nextSection: sections[0]._id,
        speed: 65,
        maxSpeed: 80,
        position: { latitude: 28.5500, longitude: 77.1000 },
        status: 'delayed',
        priority: 3,
        passengers: 1200,
        delay: 180,
        scheduledArrival: new Date(Date.now() + 1800000),
        estimatedArrival: new Date(Date.now() + 1980000)
      },
      {
        trainId: 'TRN-004',
        name: 'Freight Delta',
        currentSection: sections[2]._id,
        nextSection: sections[3]._id,
        speed: 75,
        maxSpeed: 140,
        position: { latitude: 28.5800, longitude: 77.3000 },
        status: 'running',
        priority: 2,
        passengers: 0,
        delay: 0,
        scheduledArrival: new Date(Date.now() + 5400000),
        estimatedArrival: new Date(Date.now() + 5400000)
      },
      {
        trainId: 'TRN-005',
        name: 'Local Epsilon',
        currentSection: sections[0]._id,
        nextSection: sections[1]._id,
        speed: 60,
        maxSpeed: 120,
        position: { latitude: 28.6400, longitude: 77.2000 },
        status: 'running',
        priority: 1,
        passengers: 450,
        delay: 90,
        scheduledArrival: new Date(Date.now() + 4200000),
        estimatedArrival: new Date(Date.now() + 4290000)
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

