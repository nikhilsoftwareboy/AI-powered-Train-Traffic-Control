import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { analyticsAPI } from '../services/api'
import socketService from '../services/socket'
import toast from 'react-hot-toast'

const COLORS = ['#00d4ff', '#ff6b6b', '#51cf66', '#ffd43b', '#9c88ff']

function Analytics() {
  const [timeSeries, setTimeSeries] = useState([])
  const [sectionPerformance, setSectionPerformance] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [hours, setHours] = useState(24)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    socketService.connect()
    fetchAnalytics()

    const interval = setInterval(fetchAnalytics, 30000) // Refresh every 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [hours])

  const fetchAnalytics = async () => {
    try {
      const [timeSeriesRes, performanceRes, dashboardRes] = await Promise.all([
        analyticsAPI.getTimeSeries(hours),
        analyticsAPI.getSectionPerformance(),
        analyticsAPI.getDashboard()
      ])
      setTimeSeries(timeSeriesRes.data.timeSeries || [])
      setSectionPerformance(performanceRes.data.performance || [])
      setDashboardData(dashboardRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
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

  const pieData = sectionPerformance.slice(0, 5).map(section => ({
    name: section.sectionName,
    value: section.efficiency
  }))

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={hours}
            label="Time Range"
            onChange={(e) => setHours(e.target.value)}
          >
            <MenuItem value={6}>Last 6 Hours</MenuItem>
            <MenuItem value={12}>Last 12 Hours</MenuItem>
            <MenuItem value={24}>Last 24 Hours</MenuItem>
            <MenuItem value={48}>Last 48 Hours</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                System Performance Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="#888"
                  />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151932', border: '1px solid #00d4ff' }}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="throughput"
                    stroke="#00d4ff"
                    fillOpacity={1}
                    fill="url(#colorThroughput)"
                    name="Throughput"
                  />
                  <Area
                    type="monotone"
                    dataKey="runningTrains"
                    stroke="#51cf66"
                    fill="#51cf66"
                    fillOpacity={0.3}
                    name="Running Trains"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Average Delay Trend
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    stroke="#888"
                  />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151932', border: '1px solid #00d4ff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgDelay"
                    stroke="#ff6b6b"
                    strokeWidth={2}
                    name="Avg Delay (s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Section Efficiency Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151932', border: '1px solid #00d4ff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Section Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectionPerformance.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="sectionName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    stroke="#888"
                  />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151932', border: '1px solid #00d4ff' }}
                  />
                  <Legend />
                  <Bar dataKey="throughput" fill="#00d4ff" name="Throughput" />
                  <Bar dataKey="efficiency" fill="#51cf66" name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Analytics

