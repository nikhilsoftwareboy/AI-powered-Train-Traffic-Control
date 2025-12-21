import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ Attach token ONLY if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ❌ DO NOT auto-redirect on auth errors
// Let frontend handle login/register errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

/* ===================== APIs ===================== */

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
}

// Trains API
export const trainsAPI = {
  getAll: () => api.get('/trains'),
  create: (data) => api.post('/trains', data),
  update: (id, data) => api.put(`/trains/${id}`, data),
  delete: (id) => api.delete(`/trains/${id}`)
}

// Sections API
export const sectionsAPI = {
  getAll: () => api.get('/sections'),
  create: (data) => api.post('/sections', data),
  update: (id, data) => api.put(`/sections/${id}`, data)
}

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTimeSeries: (hours = 24) =>
    api.get(`/analytics/timeseries?hours=${hours}`),
  getSectionPerformance: () =>
    api.get('/analytics/sections/performance')
}

// Optimization API
export const optimizationAPI = {
  getSchedule: () => api.post('/optimization/schedule'),
  getPredictions: (horizon = 15) =>
    api.get(`/optimization/predictions?horizon=${horizon}`),
  applyRecommendations: (recommendations) =>
    api.post('/optimization/apply', { recommendations })
}

export default api
