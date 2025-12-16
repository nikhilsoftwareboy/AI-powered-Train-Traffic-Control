import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Trains API
export const trainsAPI = {
  getAll: () => api.get('/trains'),
  getById: (id) => api.get(`/trains/${id}`),
  create: (data) => api.post('/trains', data),
  update: (id, data) => api.put(`/trains/${id}`, data),
  delete: (id) => api.delete(`/trains/${id}`),
  updatePosition: (id, position) => api.post(`/trains/${id}/position`, position)
}

// Sections API
export const sectionsAPI = {
  getAll: () => api.get('/sections'),
  getById: (id) => api.get(`/sections/${id}`),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.put(`/sections/${id}`, data),
  getStats: (id) => api.get(`/sections/${id}/stats`)
}

// Optimization API
export const optimizationAPI = {
  getSchedule: () => api.post('/optimization/schedule'),
  getPredictions: (horizon = 15) => api.get(`/optimization/predictions?horizon=${horizon}`),
  applyRecommendations: (recommendations) => api.post('/optimization/apply', { recommendations })
}

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTimeSeries: (hours = 24) => api.get(`/analytics/timeseries?hours=${hours}`),
  getSectionPerformance: () => api.get('/analytics/sections/performance')
}

export default api

