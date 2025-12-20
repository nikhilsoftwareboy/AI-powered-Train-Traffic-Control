const mongoose = require('mongoose')
const User = require('../models/User')
require('dotenv').config()

const seedUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/train-control', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB connected')

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@traincontrol.com' })
    if (existingAdmin) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    // Create default admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@traincontrol.com',
      password: 'admin123',
      fullName: 'System Administrator',
      role: 'admin'
    })

    await admin.save()
    console.log('✅ Default admin user created:')
    console.log('   Email: admin@traincontrol.com')
    console.log('   Password: admin123')

    // Create operator user
    const operator = new User({
      username: 'operator',
      email: 'operator@traincontrol.com',
      password: 'operator123',
      fullName: 'Train Operator',
      role: 'operator'
    })

    await operator.save()
    console.log('✅ Default operator user created:')
    console.log('   Email: operator@traincontrol.com')
    console.log('   Password: operator123')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding users:', error)
    process.exit(1)
  }
}

seedUser()

