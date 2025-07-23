'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  photographerName?: string
  propertyAddress: string
  shootDate: string
  status: string
  totalAmount?: number // Gjør dette optional
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true
    return order.status === statusFilter
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
      ASSIGNED: 'bg-blue-900/20 text-blue-400 border-blue-800',
      IN_PROGRESS: 'bg-purple-900/20 text-purple-400 border-purple-800',
      COMPLETED: 'bg-green-900/20 text-green-400 border-green-800',
      CANCELLED: 'bg-red-900/20 text-red-400 border-red-800'
    }
    return colors[status] || 'bg-gray-900/20 text-gray-400 border-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Venter',
      ASSIGNED: 'Tildelt',
      IN_PROGRESS: 'Under arbeid',
      COMPLETED: 'Fullført',
      CANCELLED: 'Kansellert'
    }
    return labels[status] || status
  }

  // Helper function for safe number formatting
  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return 'kr 0'
    return `kr ${amount.toLocaleString('nb-NO')}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Bestillinger</h1>
        <button className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ny bestilling
        </button>
      </div>

      {/* Filters and view toggle */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Alle statuser</option>
              <option value="PENDING">Venter</option>
              <option value="ASSIGNED">Tildelt</option>
              <option value="IN_PROGRESS">Under arbeid</option>
              <option value="COMPLETED">Fullført</option>
              <option value="CANCELLED">Kansellert</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-nordvik-900 text-white' : 'bg-dark-800 text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-nordvik-900 text-white' : 'bg-dark-800 text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Orders list/grid */}
      {viewMode === 'list' ? (
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fotograf
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Dato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Beløp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-b border-dark-800 hover:bg-dark-800/50 cursor-pointer"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-200">#{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{order.customerName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{order.photographerName || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300">{order.propertyAddress}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">
                      {new Date(order.shootDate).toLocaleDateString('nb-NO')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-200">
                      {formatAmount(order.totalAmount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-6 hover:border-dark-700 transition-colors cursor-pointer"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-200">#{order.orderNumber}</h3>
                <span className={`status-badge ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{order.customerName}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{order.propertyAddress}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(order.shootDate).toLocaleDateString('nb-NO')}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between items-center">
                <span className="text-sm text-gray-500">Fotograf:</span>
                <span className="text-sm font-medium text-gray-300">{order.photographerName || 'Ikke tildelt'}</span>
              </div>
              
              <div className="mt-2 text-lg font-bold text-nordvik-400">
                {formatAmount(order.totalAmount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}