import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  LinearProgress,
  MenuItem
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { sectionsAPI } from '../services/api'
import socketService from '../services/socket'
import toast from 'react-hot-toast'

function Sections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    sectionId: '',
    name: '',
    length: 1000,
    maxCapacity: 3,
    speedLimit: 120,
    status: 'operational',
    startPoint: { latitude: 28.6139, longitude: 77.2090 },
    endPoint: { latitude: 28.6239, longitude: 77.2190 }
  })

  useEffect(() => {
    socketService.connect()
    fetchSections()

    socketService.on('section:created', (section) => {
      setSections(prev => [section, ...prev])
    })

    socketService.on('section:updated', (section) => {
      setSections(prev => prev.map(s => s._id === section._id ? section : s))
    })

    return () => {
      socketService.disconnect()
    }
  }, [])

  const fetchSections = async () => {
    try {
      const response = await sectionsAPI.getAll()
      setSections(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast.error('Failed to load sections')
      setLoading(false)
    }
  }

  const handleOpen = (section = null) => {
    if (section) {
      setEditing(section)
      setFormData({
        sectionId: section.sectionId || '',
        name: section.name || '',
        length: section.length || 1000,
        maxCapacity: section.maxCapacity || 3,
        speedLimit: section.speedLimit || 120,
        status: section.status || 'operational',
        startPoint: section.startPoint || { latitude: 28.6139, longitude: 77.2090 },
        endPoint: section.endPoint || { latitude: 28.6239, longitude: 77.2190 }
      })
    } else {
      setEditing(null)
      setFormData({
        sectionId: '',
        name: '',
        length: 1000,
        maxCapacity: 3,
        speedLimit: 120,
        status: 'operational',
        startPoint: { latitude: 28.6139, longitude: 77.2090 },
        endPoint: { latitude: 28.6239, longitude: 77.2190 }
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
  }

  const handleSubmit = async () => {
    try {
      if (editing) {
        await sectionsAPI.update(editing._id, formData)
        toast.success('Section updated successfully')
      } else {
        await sectionsAPI.create(formData)
        toast.success('Section created successfully')
      }
      handleClose()
      fetchSections()
    } catch (error) {
      console.error('Error saving section:', error)
      toast.error('Failed to save section')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'success'
      case 'congested': return 'error'
      case 'maintenance': return 'warning'
      default: return 'default'
    }
  }

  const getUtilization = (section) => {
    const current = section.currentTrains?.length || 0
    const max = section.maxCapacity || 3
    return (current / max) * 100
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Section Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Section
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sections.map((section, index) => {
            const utilization = getUtilization(section)
            return (
              <Grid item xs={12} md={6} lg={4} key={section._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {section.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {section.sectionId}
                          </Typography>
                        </Box>
                        <Chip
                          label={section.status}
                          size="small"
                          color={getStatusColor(section.status)}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Utilization
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {utilization.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={utilization}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: utilization > 80 ? 'error.main' :
                                       utilization > 60 ? 'warning.main' : 'success.main'
                            }
                          }}
                        />
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Current Trains
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {section.currentTrains?.length || 0} / {section.maxCapacity}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Throughput
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {section.throughput || 0} trains/hr
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Speed Limit
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {section.speedLimit} km/h
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Length
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {section.length}m
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(section)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Section' : 'Add New Section'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Section ID"
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Section Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Length (meters)"
              type="number"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Max Capacity"
              type="number"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Speed Limit (km/h)"
              type="number"
              value={formData.speedLimit}
              onChange={(e) => setFormData({ ...formData, speedLimit: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="congested">Congested</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Start Point</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Latitude"
                type="number"
                value={formData.startPoint.latitude}
                onChange={(e) => setFormData({
                  ...formData,
                  startPoint: { ...formData.startPoint, latitude: parseFloat(e.target.value) }
                })}
                fullWidth
              />
              <TextField
                label="Longitude"
                type="number"
                value={formData.startPoint.longitude}
                onChange={(e) => setFormData({
                  ...formData,
                  startPoint: { ...formData.startPoint, longitude: parseFloat(e.target.value) }
                })}
                fullWidth
              />
            </Box>
            <Typography variant="subtitle2">End Point</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Latitude"
                type="number"
                value={formData.endPoint.latitude}
                onChange={(e) => setFormData({
                  ...formData,
                  endPoint: { ...formData.endPoint, latitude: parseFloat(e.target.value) }
                })}
                fullWidth
              />
              <TextField
                label="Longitude"
                type="number"
                value={formData.endPoint.longitude}
                onChange={(e) => setFormData({
                  ...formData,
                  endPoint: { ...formData.endPoint, longitude: parseFloat(e.target.value) }
                })}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Sections

