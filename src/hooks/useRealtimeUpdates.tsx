'use client'

import { useEffect, useState } from 'react'
import { wsClient, WSMessage } from '../lib/websocket/client'
import { showToast } from '../components/ui/Toast'

interface UseRealtimeOptions {
  onOrderUpdate?: (order: any) => void
  onUserActivity?: (activity: any) => void
  onNotification?: (notification: any) => void
}

export function useRealtimeUpdates(options: UseRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    // Connect to WebSocket
    // I produksjon, hent userId fra auth context
    const userId = 'current-user-id' 
    wsClient.connect(userId)
    setIsConnected(true)

    // Subscribe to updates
    const unsubscribers = [
      wsClient.subscribe('order_update', (message) => {
        if (options.onOrderUpdate) {
          options.onOrderUpdate(message.payload)
        }
        
        // Vis toast notification
        showToast({
          type: 'info',
          title: 'Ordre oppdatert',
          message: `Ordre #${message.payload.orderNumber} har blitt oppdatert`,
          action: {
            label: 'Se ordre',
            onClick: () => window.location.href = `/orders/${message.payload.id}`
          }
        })
      }),

      wsClient.subscribe('user_activity', (message) => {
        // Oppdater aktive brukere
        setActiveUsers(prev => {
          const newMap = new Map(prev)
          if (message.payload.status === 'online') {
            newMap.set(message.userId!, message.payload)
          } else {
            newMap.delete(message.userId!)
          }
          return newMap
        })

        if (options.onUserActivity) {
          options.onUserActivity(message.payload)
        }
      }),

      wsClient.subscribe('notification', (message) => {
        if (options.onNotification) {
          options.onNotification(message.payload)
        }

        // Vis notification som toast
        showToast({
          type: message.payload.type || 'info',
          title: message.payload.title,
          message: message.payload.message
        })
      })
    ]

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub())
      wsClient.disconnect()
      setIsConnected(false)
    }
  }, [])

  // Send activity update
  const sendActivity = (activity: any) => {
    wsClient.send({
      type: 'user_activity',
      payload: activity
    })
  }

  // Broadcast order update
  const broadcastOrderUpdate = (order: any) => {
    wsClient.send({
      type: 'order_update',
      payload: order
    })
  }

  return {
    isConnected,
    activeUsers: Array.from(activeUsers.values()),
    sendActivity,
    broadcastOrderUpdate
  }
}