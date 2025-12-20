const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

/* =======================
   ALLOWED ORIGINS (CORS)
======================= */
const allowedOrigins = [
  process.env.CLIENT_URL,        // Vercel frontend
  'http://localhost:3000'        // Local dev
].filter(Boolean);

/* =======================
   SOCKET.IO SETUP
======================= */
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

/* =======================
   DATABASE CONNECTION
======================= */
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/train-control',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));



/* =======================
   ROUTES
======================= */
const trainRoutes = require('./routes/trains');
const sectionRoutes = require('./routes/sections');
const optimizationRoutes = require('./routes/optimization');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/optimization', optimizationRoutes);
app.use('/api/analytics', analyticsRoutes);

/* =======================
   HEALTH CHECK (RENDER)
======================= */
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/* =======================
   SOCKET.IO EVENTS
======================= */
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('subscribe', (sectionId) => {
    socket.join(`section-${sectionId}`);
    console.log(`📡 Client ${socket.id} subscribed to section ${sectionId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

/* =======================
   MAKE IO AVAILABLE
======================= */
app.set('io', io);

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
