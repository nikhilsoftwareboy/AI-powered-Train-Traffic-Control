import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TrainMap from './pages/TrainMap'
import Optimization from './pages/Optimization'
import Analytics from './pages/Analytics'
import Trains from './pages/Trains'
import Sections from './pages/Sections'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/map" element={<TrainMap />} />
                  <Route path="/optimization" element={<Optimization />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/trains" element={<Trains />} />
                  <Route path="/sections" element={<Sections />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Box>
  )
}

export default App

