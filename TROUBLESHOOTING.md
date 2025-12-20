# Troubleshooting Guide

## Common Errors and Solutions

### 1. "Cannot find module" or Import Errors

**Error:** `Cannot find module '../contexts/AuthContext'` or similar

**Solution:**
```bash
# Make sure all dependencies are installed
cd frontend
npm install

cd ../backend
npm install
```

### 2. Authentication Errors

**Error:** `401 Unauthorized` or `Token is not valid`

**Solutions:**
- Make sure you've seeded the default users:
  ```bash
  cd backend
  npm run seed:user
  ```
- Check that your `.env` file has `JWT_SECRET` set
- Clear browser localStorage and login again
- Verify MongoDB is running

### 3. MongoDB Connection Errors

**Error:** `MongoDB connection error` or `MongooseError`

**Solutions:**
- Ensure MongoDB is running:
  - Windows: `net start MongoDB`
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`
- Check your `MONGODB_URI` in `.env` file
- Verify MongoDB is accessible on port 27017

### 4. CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions:**
- Check `CLIENT_URL` in backend `.env` matches your frontend URL
- Ensure both servers are running
- Clear browser cache

### 5. Port Already in Use

**Error:** `Port 5000 is already in use` or `Port 3000 is already in use`

**Solutions:**
- Change port in `backend/.env`: `PORT=5001`
- Change port in `frontend/vite.config.js`: `port: 3001`
- Kill the process using the port:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - macOS/Linux: `lsof -ti:5000 | xargs kill`

### 6. React Hook Errors

**Error:** `React Hook "useAuth" is called conditionally` or `Hooks can only be called inside function components`

**Solutions:**
- Ensure `AuthProvider` wraps your entire app in `main.jsx`
- Don't call hooks conditionally
- Make sure all components using `useAuth` are inside `AuthProvider`

### 7. Socket.io Connection Errors

**Error:** `Socket connection failed` or `WebSocket connection failed`

**Solutions:**
- Verify backend server is running
- Check `VITE_SOCKET_URL` in frontend `.env`
- Ensure CORS is properly configured
- Check browser console for specific error messages

### 8. Missing Dependencies

**Error:** `Module not found: Can't resolve '@mui/material'` or similar

**Solutions:**
```bash
cd frontend
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install socket.io-client react-router-dom recharts leaflet react-leaflet axios framer-motion date-fns react-hot-toast
```

### 9. Build Errors

**Error:** `Failed to compile` or build errors

**Solutions:**
- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Check Node.js version (should be v16+)
- Clear Vite cache: `rm -rf frontend/node_modules/.vite`

### 10. Login Page Not Redirecting

**Error:** After login, stays on login page or redirects incorrectly

**Solutions:**
- Check browser console for errors
- Verify token is being stored: `localStorage.getItem('token')`
- Check `AuthContext` is properly set up
- Verify routes in `App.jsx`

## Quick Fixes

### Reset Everything
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend  
cd ../frontend
rm -rf node_modules
npm install
```

### Check All Services
1. MongoDB is running
2. Backend server is running (port 5000)
3. Frontend server is running (port 3000)
4. `.env` files are configured correctly

### Verify Installation
```bash
# Check Node version
node --version  # Should be v16+

# Check MongoDB
mongod --version

# Check if ports are available
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :5000
lsof -i :3000
```

## Getting Help

If you're still experiencing issues:

1. Check the browser console (F12) for errors
2. Check the terminal/console where servers are running
3. Verify all environment variables are set
4. Ensure all dependencies are installed
5. Try clearing browser cache and localStorage

## Default Credentials

After running `npm run seed:user`:
- **Admin**: `admin@traincontrol.com` / `admin123`
- **Operator**: `operator@traincontrol.com` / `operator123`

