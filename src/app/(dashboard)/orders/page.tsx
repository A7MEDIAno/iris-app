'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '../../../components/ui/Toast'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  photographerName?: string
  propertyAddress: string
  shootDate: string
  status: string
  totalAmount: number
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadOrders()
  }, [currentPage])

  async function loadOrders() {
    try {
      const res = await fetch(`/api/orders?page=${currentPage}&limit=20`)
      if (!res.ok) throw new Error('Failed to load orders')
      
      const data = await res.json()
      
      // Sikre at orders er en array
      setOrders(Array.isArray(data.orders) ? data.orders : [])
      
      // Håndter pagination
      if (data.pagination) {
        setTotalPages(data.pagination.pages || 1)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste ordre',
        message: 'Prøv igjen senere'
      })
      setOrders([]) // Sett tom array ved feil
    } finally {
      setIsLoading(false)
    }
  }

  // Sikker filtrering
  const filteredOrders = orders.filter((order) => {
    if (!order) return false
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = !searchTerm || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.includes(searchTerm)
    
    return matchesStatus && matchesSearch
  })

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-900/20 text-yellow-400',
      ASSIGNED: 'bg-blue-900/20 text-blue-400',
      IN_PROGRESS: 'bg-purple-900/20 text-purple-400',
      COMPLETED: 'bg-green-900/20 text-green-400',
      CANCELLED: 'bg-red-900/20 text-red-400'
    }
    return colors[status] || 'bg-gray-900/20 text-gray-400'
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      PENDING: 'Venter',
      ASSIGNED: 'Tildelt',
      IN_PROGRESS: 'Under arbeid',
      COMPLETED: 'Fullført',
      CANCELLED: 'Kansellert'
    }
    return labels[status] || status
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Ordre</h1>
          <p className="text-gray-400 mt-1">Administrer alle fotograferingsoppdrag</p>
        </div>
        <button 
          onClick={() => router.push('/orders/new')}
          className="btn-primary"
        >
          Ny ordre
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Søk etter kunde, adresse eller ordrenummer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
      </div>

      {/* Orders table */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fotograf
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Dato
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-200">#{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{order.customerName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">{order.propertyAddress}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">{order.photographerName || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {new Date(order.shootDate).toLocaleDateString('nb-NO')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/orders/${order.id}`)}
                        className="text-nordvik-400 hover:text-nordvik-300 text-sm font-medium"
                      >
                        Se detaljer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Ingen ordre matcher søket'
                      : 'Ingen ordre ennå'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-dark-800 px-6 py-4 flex items-center justify-between border-t border-dark-700">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Forrige
            </button>
            <span className="text-sm text-gray-400">
              Side {currentPage} av {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Neste
            </button>
          </div>
        )}
      </div>
    </div>
  )
}