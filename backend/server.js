const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/train-control', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const trainRoutes = require('./routes/trains');
const sectionRoutes = require('./routes/sections');
const optimizationRoutes = require('./routes/optimization');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/trains', trainRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', (sectionId) => {
    socket.join(`section-${sectionId}`);
    console.log(`Client ${socket.id} subscribed to section ${sectionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

