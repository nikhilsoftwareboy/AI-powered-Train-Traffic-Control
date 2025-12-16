import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Box, Typography, Card, CardContent, Chip, CircularProgress } from '@mui/material'
import { Icon } from 'leaflet'
import { trainsAPI, sectionsAPI } from '../services/api'
import socketService from '../services/socket'
import toast from 'react-hot-toast'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom train icon
const createTrainIcon = (status) => {
  const color =
    status === 'running'
      ? '#00d4ff'
      : status === 'delayed'
      ? '#ff6b6b'
      : '#ffd43b'

  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="#fff" stroke-width="2"/>
      <rect x="10" y="12" width="12" height="8" rx="2" fill="#ffffff"/>
      <circle cx="13" cy="22" r="2" fill="#ffffff"/>
      <circle cx="19" cy="22" r="2" fill="#ffffff"/>
    </svg>
  `

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}


function MapUpdater({ trains, sections }) {
  const map = useMap()
  
  useEffect(() => {
    if (trains.length > 0) {
      const bounds = trains
        .filter(t => t.position?.latitude && t.position?.longitude)
        .map(t => [t.position.latitude, t.position.longitude])
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [trains, map])

  return null
}

function TrainMap() {
  const [trains, setTrains] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [center] = useState([28.6139, 77.2090]) // Default to Delhi

  useEffect(() => {
    socketService.connect()
    fetchData()

    socketService.on('train:position', (data) => {
      setTrains(prev => prev.map(train => 
        train._id === data.trainId 
          ? { ...train, position: data.position }
          : train
      ))
    })

    socketService.on('train:updated', (train) => {
      setTrains(prev => prev.map(t => t._id === train._id ? train : t))
    })

    return () => {
      socketService.disconnect()
    }
  }, [])

  const fetchData = async () => {
    try {
      const [trainsRes, sectionsRes] = await Promise.all([
        trainsAPI.getAll(),
        sectionsAPI.getAll()
      ])
      setTrains(trainsRes.data)
      setSections(sectionsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching map data:', error)
      toast.error('Failed to load map data')
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

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Live Train Map
      </Typography>

      <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`${trains.length} Trains`} color="primary" />
            <Chip label={`${sections.length} Sections`} color="secondary" />
            <Chip 
              label={`${trains.filter(t => t.status === 'running').length} Running`} 
              color="success" 
            />
            <Chip 
              label={`${trains.filter(t => t.status === 'delayed').length} Delayed`} 
              color="error" 
            />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ height: '70vh', borderRadius: 2, overflow: 'hidden' }}>
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater trains={trains} sections={sections} />

          {/* Draw sections */}
          {sections.map(section => (
            <Polyline
              key={section._id}
              positions={[
                [section.startPoint.latitude, section.startPoint.longitude],
                [section.endPoint.latitude, section.endPoint.longitude]
              ]}
              color={section.status === 'congested' ? '#ff6b6b' : '#00d4ff'}
              weight={3}
              opacity={0.6}
            />
          ))}

          {/* Draw train markers */}
          {trains
            .filter(train => train.position?.latitude && train.position?.longitude)
            .map(train => (
              <Marker
                key={train._id}
                position={[train.position.latitude, train.position.longitude]}
                icon={createTrainIcon(train.status)}
              >
                <Popup>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {train.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {train.status}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Speed: {train.speed} km/h
                    </Typography>
                    {train.delay > 0 && (
                      <Typography variant="body2" color="error">
                        Delay: {train.delay}s
                      </Typography>
                    )}
                    {train.currentSection && (
                      <Typography variant="body2" color="text.secondary">
                        Section: {train.currentSection.name || 'N/A'}
                      </Typography>
                    )}
                  </Box>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </Box>
    </Box>
  )
}

export default TrainMap

