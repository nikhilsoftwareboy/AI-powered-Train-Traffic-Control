import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    // Set up default listeners
    this.setupDefaultListeners()
  }

  setupDefaultListeners() {
    const events = [
      'train:created',
      'train:updated',
      'train:deleted',
      'train:position',
      'train:optimized',
      'section:created',
      'section:updated',
      'optimization:updated'
    ]

    events.forEach(event => {
      this.socket.on(event, (data) => {
        const listeners = this.listeners.get(event) || []
        listeners.forEach(callback => callback(data))
      })
    })
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    const listeners = this.listeners.get(event) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }

    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  subscribe(sectionId) {
    this.emit('subscribe', sectionId)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
    }
  }
}

export default new SocketService()

