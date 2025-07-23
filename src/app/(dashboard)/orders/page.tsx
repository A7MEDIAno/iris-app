'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AssignPhotographerModal } from '../../../components/orders/AssignPhotographerModal'

export default function OrdersPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setError(null)
      
      const ordersRes = await fetch('/api/orders')
      if (!ordersRes.ok) {
        throw new Error(`Orders API failed: ${ordersRes.status}`)
      }
      const ordersData = await ordersRes.json()
      setOrders(Array.isArray(ordersData) ? ordersData : [])

      const customersRes = await fetch('/api/customers')
      if (!customersRes.ok) {
        console.warn('Customers API failed:', customersRes.status)
      } else {
        const customersData = await customersRes.json()
        setCustomers(Array.isArray(customersData) ? customersData : [])
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      setError(error.message || 'Kunne ikke laste data')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAssignPhotographer(orderId: string, photographerId: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photographerId })
      })
      
      if (res.ok) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, photographerId, status: 'ASSIGNED' }
              : order
          )
        )
        loadData()
      }
    } catch (error) {
      console.error('Error assigning photographer:', error)
    }
  }

  function openAssignModal(order: any) {
    setSelectedOrder(order)
    setShowAssignModal(true)
  }

  function getCustomerName(customerId: string) {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || 'Ukjent kunde'
  }

  function getStatusColor(status: string) {
    const colors = {
      PENDING: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
      ASSIGNED: 'bg-blue-900/20 text-blue-400 border-blue-800',
      IN_PROGRESS: 'bg-purple-900/20 text-purple-400 border-purple-800',
      COMPLETED: 'bg-green-900/20 text-green-400 border-green-800',
      CANCELLED: 'bg-red-900/20 text-red-400 border-red-800'
    }
    return colors[status] || 'bg-gray-900/20 text-gray-400 border-gray-800'
  }

  function getStatusText(status: string) {
    const texts = {
      PENDING: 'Venter',
      ASSIGNED: 'Tildelt',
      IN_PROGRESS: 'Under arbeid',
      COMPLETED: 'Fullført',
      CANCELLED: 'Kansellert'
    }
    return texts[status] || status
  }

  // Filter orders basert på status og søk
  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = order.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCustomerName(order.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toString().includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Kunne ikke laste oppdrag</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary">
            Prøv igjen
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Laster oppdrag...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Bestillinger</h1>
          <p className="text-gray-400 mt-1">Administrer foto-oppdrag</p>
        </div>
        <Link href="/orders/new" className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ny bestilling
        </Link>
      </div>

      {/* Filters - Pholio style */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Søk */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Søk etter adresse, kunde, ordrenummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Status filter */}
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

          {/* View toggle */}
          <div className="flex bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-nordvik-900 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-nordvik-900 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-6 mt-6 pt-6 border-t border-dark-800">
          <div>
            <p className="text-sm text-gray-500">Totalt</p>
            <p className="text-2xl font-semibold text-gray-100">{orders.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Venter</p>
            <p className="text-2xl font-semibold text-yellow-400">{orders.filter((o: any) => o.status === 'PENDING').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Under arbeid</p>
            <p className="text-2xl font-semibold text-blue-400">{orders.filter((o: any) => o.status === 'IN_PROGRESS').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fullført</p>
            <p className="text-2xl font-semibold text-green-400">{orders.filter((o: any) => o.status === 'COMPLETED').length}</p>
          </div>
        </div>
      </div>

      {/* Orders Grid/List */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Ingen oppdrag funnet</h3>
          <p className="text-gray-500 mb-6">Prøv å justere søket eller filteret</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order: any) => (
            <div key={order.id} className="card card-hover overflow-hidden group">
              {/* Bilde placeholder - Pholio style */}
              <div className="h-48 bg-dark-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-3 left-3 right-3 z-20">
                  <p className="text-white font-semibold text-lg truncate">{order.propertyAddress}</p>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500">#{order.orderNumber}</p>
                    <p className="font-medium text-gray-200">{getCustomerName(order.customerId)}</p>
                  </div>
                  <span className={`status-badge border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(order.scheduledDate).toLocaleDateString('nb-NO')}
                  </div>
                  
                  {order.photographer ? (
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {order.photographer.name}
                    </div>
                  ) : (
                    <button
                      onClick={() => openAssignModal(order)}
                      className="flex items-center text-nordvik-400 hover:text-nordvik-300 font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Tildel fotograf
                    </button>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-dark-800">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm text-nordvik-400 hover:text-nordvik-300 font-medium flex items-center justify-between group"
                  >
                    <span>Se detaljer</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view - Pholio style
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ordre</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kunde</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fotograf</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dato</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.propertyAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {getCustomerName(order.customerId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.photographer ? (
                      order.photographer.name
                    ) : (
                      <button
                        onClick={() => openAssignModal(order)}
                        className="text-nordvik-400 hover:text-nordvik-300"
                      >
                        Tildel
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(order.scheduledDate).toLocaleDateString('nb-NO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-nordvik-400 hover:text-nordvik-300"
                    >
                      Se detaljer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AssignPhotographerModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onAssign={(photographerId) => handleAssignPhotographer(selectedOrder.id, photographerId)}
      />
    </div>
  )
}