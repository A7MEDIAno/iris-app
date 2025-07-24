'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import QuickActions from '@/components/QuickActions'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    activePhotographers: 0,
    monthlyRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [photographers, setPhotographers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Load statistics
      const statsRes = await fetch('/api/analytics')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      // Load recent orders
      const ordersRes = await fetch('/api/orders?limit=5')
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setRecentOrders(data.orders || [])
      }

      // Load photographers
      const photographersRes = await fetch('/api/photographers?limit=5')
      if (photographersRes.ok) {
        const data = await photographersRes.json()
        setPhotographers(data.photographers || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400 mt-1">Oversikt over aktivitet og statistikk</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-gray-400 hover:text-gray-300"
        >
          Siste 30 dager ↻
        </button>
      </div>

      {/* Statistikk widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Totalt ordre */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Totalt ordre</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-dark-800 rounded-lg">
              <svg className="w-6 h-6 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Fullført denne måneden */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Fullført denne måneden</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.completedOrders}</p>
              <p className="text-xs text-green-400 mt-1">+12% fra forrige måned</p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kunder */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Kunder</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aktive fotografer */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Aktive fotografer</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.activePhotographers}</p>
              <p className="text-xs text-gray-500 mt-1">av {stats.activePhotographers + 1} totalt</p>
            </div>
            <div className="p-3 bg-pink-900/20 rounded-lg">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* HURTIGHANDLINGER */}
      <QuickActions />

      {/* Ordre status og fotografer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Ordre status */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Ordre status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">Venter</span>
              </div>
              <span className="text-sm font-medium text-gray-100">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">Tildelt</span>
              </div>
              <span className="text-sm font-medium text-gray-100">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">Under arbeid</span>
              </div>
              <span className="text-sm font-medium text-gray-100">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">Fullført</span>
              </div>
              <span className="text-sm font-medium text-gray-100">{stats.completedOrders}</span>
            </div>
          </div>
        </div>

        {/* Fotografer */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Fotografer</h2>
            <button
              onClick={() => router.push('/photographers')}
              className="text-sm text-nordvik-400 hover:text-nordvik-300"
            >
              Se alle →
            </button>
          </div>
          
          {photographers.length > 0 ? (
            <div className="space-y-3">
              {photographers.map((photographer: any) => (
                <div key={photographer.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-nordvik-400 to-nordvik-600 rounded-full flex items-center justify-center text-white font-medium">
                      {photographer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-100">{photographer.name}</p>
                      <p className="text-xs text-gray-400">{photographer.activeOrders || 0} aktive oppdrag</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    photographer.status === 'available' 
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-gray-900/20 text-gray-400'
                  }`}>
                    {photographer.status === 'available' ? 'Tilgjengelig' : 'Opptatt'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Ingen fotografer registrert ennå</p>
          )}
        </div>
      </div>

      {/* Siste aktivitet */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Siste aktivitet</h2>
          <button
            onClick={() => router.push('/orders')}
            className="text-sm text-nordvik-400 hover:text-nordvik-300"
          >
            Se alle ordre →
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer"
                   onClick={() => router.push(`/orders/${order.id}`)}>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-100">#{order.orderNumber}</span>
                    <span className="mx-2 text-gray-600">•</span>
                    <span className="text-sm text-gray-400">{order.customerName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{order.propertyAddress}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('nb-NO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Ingen ordre ennå</p>
        )}
      </div>
    </div>
  )
}