'use client'

import { useState, useEffect } from 'react'
import { showToast } from '../../../components/ui/Toast'
import QuickActions from '@/components/QuickActions'

interface DashboardData {
  overview: {
    totalOrders: number
    completedOrders: number
    totalCustomers: number
    activePhotographers: number
    completionRate: number
  }
  ordersByStatus: Array<{
    status: string
    count: number
  }>
  ordersByPhotographer: Array<{
    name: string
    count: number
  }>
  recentOrders: Array<{
    id: string
    orderNumber: number
    customerName: string
    photographerName?: string
    status: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    loadDashboardData()
  }, [period])

  async function loadDashboardData() {
    try {
      const res = await fetch(`/api/analytics?period=${period}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste dashboard',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Ingen data tilgjengelig</p>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
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

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-900/20 text-yellow-400',
    ASSIGNED: 'bg-blue-900/20 text-blue-400',
    IN_PROGRESS: 'bg-purple-900/20 text-purple-400',
    EDITING: 'bg-indigo-900/20 text-indigo-400',
    QUALITY_CONTROL: 'bg-orange-900/20 text-orange-400',
    READY_FOR_DELIVERY: 'bg-cyan-900/20 text-cyan-400',
    DELIVERED: 'bg-teal-900/20 text-teal-400',
    COMPLETED: 'bg-green-900/20 text-green-400',
    CANCELLED: 'bg-red-900/20 text-red-400'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400 mt-1">Oversikt over aktivitet og statistikk</p>
        </div>
        
        {/* Period selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input-field"
        >
          <option value="7">Siste 7 dager</option>
          <option value="30">Siste 30 dager</option>
          <option value="90">Siste 90 dager</option>
          <option value="365">Siste år</option>
        </select>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totalt ordre</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{data.overview.totalOrders}</p>
            </div>
            <div className="bg-nordvik-900/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fullført</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{data.overview.completedOrders}</p>
              <p className="text-xs text-green-400 mt-1">{data.overview.completionRate}% fullføringsrate</p>
            </div>
            <div className="bg-green-900/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kunder</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{data.overview.totalCustomers}</p>
            </div>
            <div className="bg-blue-900/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive fotografer</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{data.overview.activePhotographers}</p>
            </div>
            <div className="bg-purple-900/20 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ordre status fordeling */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Ordre status</h3>
          <div className="space-y-3">
            {data.ordersByStatus && data.ordersByStatus.length > 0 ? (
              data.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${statusColors[item.status] || 'bg-gray-900/20 text-gray-400'}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Ingen ordre ennå</p>
            )}
          </div>
        </div>

        {/* Fotografer ranking */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Fotografer</h3>
          <div className="space-y-3">
            {data.ordersByPhotographer && data.ordersByPhotographer.length > 0 ? (
              data.ordersByPhotographer.map((photographer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-nordvik-800 rounded-full flex items-center justify-center text-xs text-white">
                      {photographer.name ? photographer.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span className="text-sm text-gray-300">{photographer.name || 'Ukjent'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{photographer.count} ordre</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Ingen fotografer har ordre ennå</p>
            )}
          </div>
        </div>

        {/* Siste ordre */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Siste aktivitet</h3>
          <div className="space-y-3">
            {data.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[order.status] || 'bg-gray-900/20 text-gray-400'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Ingen ordre ennå</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}