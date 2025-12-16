import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TrainMap from './pages/TrainMap'
import Optimization from './pages/Optimization'
import Analytics from './pages/Analytics'
import Trains from './pages/Trains'
import Sections from './pages/Sections'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<TrainMap />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/trains" element={<Trains />} />
          <Route path="/sections" element={<Sections />} />
        </Routes>
      </Layout>
    </Box>
  )
}

export default App

