import { useState, useEffect } from 'react'
import { optimizationAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'


import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  CircularProgress
} from '@mui/material'
import {
  Train as TrainIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { analyticsAPI } from '../services/api'
import socketService from '../services/socket'
import toast from 'react-hot-toast'

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main` }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: `${color}.main`, opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Chip
            label={trend}
            size="small"
            color={trend.includes('+') ? 'success' : 'error'}
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  </motion.div>
)

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    socketService.connect()
    fetchDashboardData()

    const interval = setInterval(fetchDashboardData, 10000) // Refresh every 10 seconds

    socketService.on('train:updated', () => {
      fetchDashboardData()
    })

    socketService.on('section:updated', () => {
      fetchDashboardData()
    })

    return () => {
      clearInterval(interval)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard()
      setDashboardData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!dashboardData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available
        </Typography>
      </Box>
    )
  }

  const { overview, congestion } = dashboardData

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        System Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Trains"
            value={overview.totalTrains}
            icon={<TrainIcon sx={{ fontSize: 40 }} />}
            color="primary"
            subtitle={`${overview.runningTrains} running`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Efficiency"
            value={`${overview.systemEfficiency.toFixed(1)}%`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="success"
            trend={overview.systemEfficiency > 80 ? '+5.2%' : '-2.1%'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Delay"
            value={`${overview.avgDelay}s`}
            icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
            color={overview.avgDelay > 300 ? 'error' : 'warning'}
            subtitle={overview.delayedTrains > 0 ? `${overview.delayedTrains} delayed` : 'On time'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Passengers"
            value={overview.totalPassengers.toLocaleString()}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="secondary"
            subtitle={`${overview.totalThroughput} trains/hr`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Section Congestion Status
              </Typography>
              {congestion && congestion.length > 0 ? (
                <Box>
                  {congestion.map((section, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {section.sectionName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={section.status}
                            size="small"
                            color={
                              section.status === 'operational' ? 'success' :
                              section.status === 'congested' ? 'error' : 'warning'
                            }
                          />
                          <Typography variant="body2" color="text.secondary">
                            {section.currentTrains}/{section.maxCapacity}
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={section.utilization}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: section.utilization > 80 ? 'error.main' :
                                     section.utilization > 60 ? 'warning.main' : 'success.main'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {section.utilization.toFixed(1)}% utilization
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No section data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Chip
  icon={<SpeedIcon />}
  label="Run AI Optimization"
  clickable
  color="primary"
  onClick={async () => {
    try {
      const res = await optimizationAPI.getSchedule()
      toast.success(
        `AI optimized ${res.data.totalTrains} trains 🚂`
      )
    } catch (err) {
      toast.error('AI Optimization failed')
      console.error(err)
    }
  }}
/>

                <Chip
  icon={<WarningIcon />}
  label="View Alerts"
  clickable
  color="warning"
  onClick={() => {
    const alerts = congestion.filter(
      s => s.utilization > 80
    )

    if (alerts.length === 0) {
      toast.success('No active alerts 🚦')
    } else {
      alerts.forEach(a =>
        toast.error(
          `⚠ ${a.sectionName} congested (${a.utilization.toFixed(1)}%)`
        )
      )
    }
  }}
/>

                <Chip
  icon={<TrendingUpIcon />}
  label="View Analytics"
  clickable
  color="secondary"
  onClick={() => navigate('/analytics')}
/>

              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard

