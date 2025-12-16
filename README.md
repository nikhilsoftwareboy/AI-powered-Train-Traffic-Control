# 🚂 AI-Powered Train Traffic Control System


OK THIS IS TESTING 


A full-stack web application for maximizing section throughput using AI-powered precise train traffic control. Built with React, Node.js, Express, MongoDB, and real-time WebSocket communication.

## ✨ Features

- **Real-time Train Monitoring**: Live tracking of train positions, speeds, and status
- **AI-Powered Optimization**: Intelligent scheduling and speed recommendations using ML algorithms
- **Interactive Map Visualization**: Leaflet-based map showing train positions and sections
- **Analytics Dashboard**: Comprehensive charts and metrics for system performance
- **Section Management**: Monitor and manage railway sections with congestion tracking
- **Predictive Analytics**: AI-based congestion prediction for future planning
- **Modern UI**: Beautiful, responsive Material-UI design with dark theme
- **Real-time Updates**: WebSocket-based live updates for instant data synchronization

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Leaflet** - Map visualization
- **Socket.io Client** - Real-time communication
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **ML-Matrix** - Machine learning utilities
- **Simple Statistics** - Statistical calculations

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Train Control"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/train-control
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
mongod
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
Train Control/
├── backend/
│   ├── models/
│   │   ├── Train.js          # Train data model
│   │   └── Section.js        # Section data model
│   ├── routes/
│   │   ├── trains.js         # Train API routes
│   │   ├── sections.js       # Section API routes
│   │   ├── optimization.js   # Optimization API routes
│   │   └── analytics.js      # Analytics API routes
│   ├── services/
│   │   └── aiOptimizer.js    # AI optimization service
│   ├── server.js             # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx    # Main layout component
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Dashboard page
│   │   │   ├── TrainMap.jsx       # Map visualization
│   │   │   ├── Optimization.jsx   # AI optimization
│   │   │   ├── Analytics.jsx      # Analytics dashboard
│   │   │   ├── Trains.jsx         # Train management
│   │   │   └── Sections.jsx       # Section management
│   │   ├── services/
│   │   │   ├── api.js         # API service
│   │   │   └── socket.js      # WebSocket service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🎯 Key Features Explained

### AI Optimization
The system uses machine learning algorithms to:
- Calculate optimal train speeds based on congestion and delays
- Predict future congestion levels
- Generate scheduling recommendations
- Adjust priorities dynamically

### Real-time Updates
- Train positions update in real-time on the map
- Section congestion levels update automatically
- Optimization recommendations refresh periodically
- All changes sync across connected clients

### Analytics
- Time series charts for system performance
- Section efficiency comparisons
- Throughput analysis
- Delay trend visualization

## 🔧 API Endpoints

### Trains
- `GET /api/trains` - Get all trains
- `GET /api/trains/:id` - Get single train
- `POST /api/trains` - Create train
- `PUT /api/trains/:id` - Update train
- `DELETE /api/trains/:id` - Delete train
- `POST /api/trains/:id/position` - Update train position

### Sections
- `GET /api/sections` - Get all sections
- `GET /api/sections/:id` - Get single section
- `POST /api/sections` - Create section
- `PUT /api/sections/:id` - Update section
- `GET /api/sections/:id/stats` - Get section statistics

### Optimization
- `POST /api/optimization/schedule` - Get optimized schedule
- `GET /api/optimization/predictions` - Get congestion predictions
- `POST /api/optimization/apply` - Apply recommendations

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/timeseries` - Get time series data
- `GET /api/analytics/sections/performance` - Get section performance

## 🎨 UI Features

- **Dark Theme**: Modern dark theme with cyan accent colors
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion animations for better UX
- **Interactive Charts**: Recharts for data visualization
- **Live Map**: Leaflet map with real-time train markers
- **Toast Notifications**: User-friendly notifications

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Historical data analysis
- [ ] Advanced ML models (LSTM, Transformer)
- [ ] Mobile app (React Native)
- [ ] Multi-railway network support
- [ ] Integration with IoT sensors
- [ ] Automated train control
- [ ] Alert system for anomalies

## 📝 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using React and Node.js**

