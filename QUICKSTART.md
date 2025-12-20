# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Setup MongoDB

Make sure MongoDB is installed and running:
- **Windows**: `net start MongoDB`
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### Step 3: Configure Environment

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/train-control
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
```

### Step 4: Seed Default Users and Sample Data

**Seed Users (Recommended):**
```bash
cd backend
npm run seed:user
```

This creates default admin and operator accounts.

**Seed Sample Data (Optional):**
```bash
cd backend
npm run seed
```

This will create sample trains and sections for testing.

### Step 5: Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Open the Application

Navigate to: **http://localhost:3000**

**Login Credentials:**
- Email: `admin@traincontrol.com`
- Password: `admin123`

## 📱 Available Pages

1. **Dashboard** (`/`) - System overview and key metrics
2. **Live Map** (`/map`) - Real-time train position visualization
3. **AI Optimization** (`/optimization`) - View and apply AI recommendations
4. **Analytics** (`/analytics`) - Detailed charts and performance metrics
5. **Trains** (`/trains`) - Manage trains (CRUD operations)
6. **Sections** (`/sections`) - Manage railway sections

## 🎯 Testing the System

1. **View Dashboard**: Check system metrics and congestion levels
2. **Explore Map**: See trains moving in real-time (if seeded)
3. **Run Optimization**: Click "Refresh" in Optimization page to generate AI recommendations
4. **Apply Recommendations**: Click "Apply Recommendations" to update train speeds
5. **View Analytics**: Check performance charts and trends

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check service status
- Verify connection string in `.env` file
- Check if MongoDB is listening on default port 27017

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.js`

### CORS Errors
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL
- Check that both servers are running

### No Data Showing
- Run seed script: `cd backend && npm run seed`
- Check browser console for errors
- Verify API endpoints are accessible

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints using Postman or similar tools
- Customize the AI optimization algorithms in `backend/services/aiOptimizer.js`
- Add more features based on your requirements

## 💡 Tips

- Use browser DevTools to monitor WebSocket connections
- Check Network tab to see API calls
- Real-time updates work best with multiple browser tabs open
- Seed data creates 5 trains and 4 sections for testing

---

**Happy Coding! 🚂**

