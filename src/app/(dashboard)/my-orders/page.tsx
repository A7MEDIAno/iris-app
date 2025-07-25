'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import { Calendar, MapPin, Camera, Clock, CheckCircle } from 'lucide-react'

interface Order {
  id: string
  orderNumber: number
  status: string
  propertyAddress: string
  propertyType?: string
  scheduledDate: string
  customer: {
    name: string
    phone?: string
  }
  totalAmount?: number
  photographerFee?: number
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming')

  useEffect(() => {
    loadOrders()
  }, [filter])

  async function loadOrders() {
    try {
      const params = new URLSearchParams({ filter })
      const res = await fetch(`/api/my-orders?${params}`)
      
      if (!res.ok) throw new Error('Failed to load orders')
      
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke laste oppdrag',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      PENDING: 'Venter',
      ASSIGNED: 'Tildelt',
      IN_PROGRESS: 'Under arbeid',
      EDITING: 'Redigering',
      QUALITY_CONTROL: 'Kvalitetskontroll',
      READY_FOR_DELIVERY: 'Klar for levering',
      DELIVERED: 'Levert',
      COMPLETED: 'Fullført',
      CANCELLED: 'Kansellert'
    }
    return labels[status] || status
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      PENDING: 'text-yellow-400',
      ASSIGNED: 'text-blue-400',
      IN_PROGRESS: 'text-purple-400',
      COMPLETED: 'text-green-400',
      CANCELLED: 'text-red-400'
    }
    return colors[status] || 'text-gray-400'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Mine oppdrag</h1>
        <p className="text-gray-400 mt-1">Oversikt over dine fotograferingsoppdrag</p>
      </div>

      {/* Filter */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'upcoming' 
                ? 'bg-nordvik-500 text-white' 
                : 'bg-dark-800 text-gray-400 hover:text-gray-300'
            }`}
          >
            Kommende
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-nordvik-500 text-white' 
                : 'bg-dark-800 text-gray-400 hover:text-gray-300'
            }`}
          >
            Fullførte
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-nordvik-500 text-white' 
                : 'bg-dark-800 text-gray-400 hover:text-gray-300'
            }`}
          >
            Alle
          </button>
        </div>
      </div>

      {/* Ordre liste */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id}
            className="bg-dark-900 rounded-lg border border-dark-800 p-6 hover:border-nordvik-500 transition-colors cursor-pointer"
            onClick={() => router.push(`/orders/${order.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-100">
                    Ordre #{order.orderNumber}
                  </h3>
                  <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {order.propertyAddress}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {formatDate(order.scheduledDate)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {formatTime(order.scheduledDate)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <Camera className="w-4 h-4 text-gray-500" />
                    {order.customer.name}
                  </div>
                </div>
              </div>
              
              {order.photographerFee && (
                <div className="text-right ml-6">
                  <p className="text-sm text-gray-400">Din inntekt</p>
                  <p className="text-xl font-semibold text-green-400">
                    {formatCurrency(Number(order.photographerFee))}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {orders.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'upcoming' 
              ? 'Ingen kommende oppdrag'
              : filter === 'completed'
              ? 'Ingen fullførte oppdrag'
              : 'Ingen oppdrag funnet'
            }
          </p>
        </div>
      )}
    </div>
  )
}