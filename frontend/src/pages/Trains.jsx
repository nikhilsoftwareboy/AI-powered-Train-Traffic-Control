import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import { trainsAPI } from '../services/api'
import socketService from '../services/socket'
import toast from 'react-hot-toast'

function Trains() {
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    trainId: '',
    name: '',
    speed: 0,
    maxSpeed: 120,
    status: 'running',
    priority: 1,
    passengers: 0,
    position: { latitude: 28.6139, longitude: 77.2090 }
  })

  useEffect(() => {
    socketService.connect()
    fetchTrains()

    socketService.on('train:created', (train) => {
      setTrains(prev => [train, ...prev])
    })

    socketService.on('train:updated', (train) => {
      setTrains(prev => prev.map(t => t._id === train._id ? train : t))
    })

    socketService.on('train:deleted', (data) => {
      setTrains(prev => prev.filter(t => t._id !== data.id))
    })

    return () => {
      socketService.disconnect()
    }
  }, [])

  const fetchTrains = async () => {
    try {
      const response = await trainsAPI.getAll()
      setTrains(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching trains:', error)
      toast.error('Failed to load trains')
      setLoading(false)
    }
  }

  const handleOpen = (train = null) => {
    if (train) {
      setEditing(train)
      setFormData({
        trainId: train.trainId || '',
        name: train.name || '',
        speed: train.speed || 0,
        maxSpeed: train.maxSpeed || 120,
        status: train.status || 'running',
        priority: train.priority || 1,
        passengers: train.passengers || 0,
        position: train.position || { latitude: 28.6139, longitude: 77.2090 }
      })
    } else {
      setEditing(null)
      setFormData({
        trainId: '',
        name: '',
        speed: 0,
        maxSpeed: 120,
        status: 'running',
        priority: 1,
        passengers: 0,
        position: { latitude: 28.6139, longitude: 77.2090 }
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
        await trainsAPI.update(editing._id, formData)
        toast.success('Train updated successfully')
      } else {
        await trainsAPI.create(formData)
        toast.success('Train created successfully')
      }
      handleClose()
      fetchTrains()
    } catch (error) {
      console.error('Error saving train:', error)
      toast.error('Failed to save train')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await trainsAPI.delete(id)
        toast.success('Train deleted successfully')
        fetchTrains()
      } catch (error) {
        console.error('Error deleting train:', error)
        toast.error('Failed to delete train')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success'
      case 'delayed': return 'error'
      case 'stopped': return 'warning'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Train Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Train
        </Button>
      </Box>

      <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Train ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Speed</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Passengers</TableCell>
                    <TableCell>Delay</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trains.map((train, index) => (
                      <TableRow
                        key={train._id}
                        sx={{
                          animation: 'fadeIn 0.3s ease-in',
                          animationDelay: `${index * 0.05}s`,
                          '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(20px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                          }
                        }}
                      >
                        <TableCell>{train.trainId}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {train.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={train.status}
                            size="small"
                            color={getStatusColor(train.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SpeedIcon fontSize="small" />
                            <Typography variant="body2">{train.speed} km/h</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={train.priority} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{train.passengers || 0}</TableCell>
                        <TableCell>
                          {train.delay > 0 ? (
                            <Typography variant="body2" color="error">
                              {train.delay}s
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="success.main">
                              On time
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(train)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(train._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Train' : 'Add New Train'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Train ID"
              value={formData.trainId}
              onChange={(e) => setFormData({ ...formData, trainId: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Train Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Speed (km/h)"
              type="number"
              value={formData.speed}
              onChange={(e) => setFormData({ ...formData, speed: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Max Speed (km/h)"
              type="number"
              value={formData.maxSpeed}
              onChange={(e) => setFormData({ ...formData, maxSpeed: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Status"
              select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="running">Running</MenuItem>
              <MenuItem value="stopped">Stopped</MenuItem>
              <MenuItem value="delayed">Delayed</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
            <TextField
              label="Priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              fullWidth
              inputProps={{ min: 1, max: 5 }}
            />
            <TextField
              label="Passengers"
              type="number"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
              fullWidth
            />
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

export default Trains

