import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { optimizationAPI } from '../services/api'
import socketService from '../services/socket'
import toast from 'react-hot-toast'

function Optimization() {
  const [schedule, setSchedule] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    socketService.connect()
    fetchOptimization()

    socketService.on('optimization:updated', (data) => {
      setSchedule(data)
    })

    return () => {
      socketService.disconnect()
    }
  }, [])

  const fetchOptimization = async () => {
    setLoading(true)
    try {
      const [scheduleRes, predictionsRes] = await Promise.all([
        optimizationAPI.getSchedule(),
        optimizationAPI.getPredictions(15)
      ])
      setSchedule(scheduleRes.data.schedule || [])
      setPredictions(predictionsRes.data.predictions || [])
    } catch (error) {
      console.error('Error fetching optimization data:', error)
      toast.error('Failed to load optimization data')
    } finally {
      setLoading(false)
    }
  }

  const applyRecommendations = async () => {
    setApplying(true)
    try {
      const recommendations = schedule.map(item => ({
        trainId: item.trainId,
        recommendedSpeed: item.recommendedSpeed,
        action: item.action
      }))

      await optimizationAPI.applyRecommendations(recommendations)
      toast.success('Optimization recommendations applied successfully!')
      
      // Refresh after applying
      setTimeout(() => {
        fetchOptimization()
      }, 1000)
    } catch (error) {
      console.error('Error applying recommendations:', error)
      toast.error('Failed to apply recommendations')
    } finally {
      setApplying(false)
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'speed_up': return 'success'
      case 'slow_down': return 'warning'
      case 'proceed': return 'info'
      default: return 'default'
    }
  }

  const getActionLabel = (action) => {
    switch (action) {
      case 'speed_up': return 'Speed Up'
      case 'slow_down': return 'Slow Down'
      case 'proceed': return 'Proceed'
      default: return 'Maintain'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          AI-Powered Optimization
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={fetchOptimization}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={applyRecommendations}
            disabled={applying || schedule.length === 0}
            startIcon={applying ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
          >
            Apply Recommendations
          </Button>
        </Box>
      </Box>

      {predictions.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Congestion Predictions (15 min):</strong> {predictions.filter(p => p.riskLevel === 'high').length} sections at high risk
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {predictions.slice(0, 4).map((prediction, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {prediction.sectionName}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {(prediction.predictedLoad * 100).toFixed(1)}%
                  </Typography>
                  <Chip
                    label={prediction.riskLevel}
                    size="small"
                    color={
                      prediction.riskLevel === 'high' ? 'error' :
                      prediction.riskLevel === 'medium' ? 'warning' : 'success'
                    }
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Optimized Schedule Recommendations
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : schedule.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No optimization recommendations available. Click Refresh to generate.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Train</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Current Speed</TableCell>
                    <TableCell align="right">Recommended Speed</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Est. Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          animation: 'fadeIn 0.3s ease-in',
                          animationDelay: `${index * 0.05}s`,
                          '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(20px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                          }
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.trainName}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.sectionId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SpeedIcon fontSize="small" />
                            <Typography variant="body2">N/A</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {item.recommendedSpeed?.toFixed(1) || 'N/A'} km/h
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getActionLabel(item.action)}
                            size="small"
                            color={getActionColor(item.action)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={(item.confidence || 0.7) * 100}
                              size={20}
                              thickness={4}
                            />
                            <Typography variant="body2">
                              {((item.confidence || 0.7) * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {item.estimatedTime ? `${item.estimatedTime}s` : 'N/A'}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Optimization

