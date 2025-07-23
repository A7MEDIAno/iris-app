import { showToast } from '@/components/ui/Toast'

export type WSMessage = {
  type: 'order_update' | 'user_activity' | 'notification' | 'presence'
  payload: any
  userId?: string
  timestamp: Date
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private listeners: Map<string, Set<(message: WSMessage) => void>> = new Map()
  private url: string
  private userId: string | null = null

  constructor() {
    // Bruk din faktiske WebSocket URL
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  }

  connect(userId: string) {
    this.userId = userId
    
    try {
      this.ws = new WebSocket(`${this.url}?userId=${userId}`)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        
        // Send initial presence
        this.send({
          type: 'presence',
          payload: { status: 'online' }
        })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.notifyListeners(message.type, message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      showToast({
        type: 'error',
        title: 'Tilkobling feilet',
        message: 'Kunne ikke koble til real-time oppdateringer'
      })
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId)
      }
    }, delay)
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: Omit<WSMessage, 'timestamp'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        userId: this.userId,
        timestamp: new Date()
      }))
    }
  }

  subscribe(type: string, callback: (message: WSMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(type)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  private notifyListeners(type: string, message: WSMessage) {
    const callbacks = this.listeners.get(type)
    if (callbacks) {
      callbacks.forEach(callback => callback(message))
    }
  }
}

// Singleton instance
export const wsClient = new WebSocketClient()