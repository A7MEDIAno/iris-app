'use client'

import { useState, useEffect } from 'react'
import { showToast } from '../../../components/ui/Toast'

interface AnalyticsData {
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [range, setRange] = useState('month')

  useEffect(() => {
    loadAnalytics()
  }, [range])

  async function loadAnalytics() {
    try {
      const res = await fetch(`/api/analytics?range=${range}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste analytics',
        message: 'Prøv igjen senere'
      })
      
      // Set default empty data
      setData({
        overview: {
          totalOrders: 0,
          completedOrders: 0,
          totalCustomers: 0,
          activePhotographers: 0,
          completionRate: 0
        },
        ordersByStatus: [],
        ordersByPhotographer: [],
        recentOrders: []
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

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Analytics</h1>
          <p className="text-gray-400 mt-1">Detaljert oversikt og statistikk</p>
        </div>
        
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="input-field"
        >
          <option value="week">Siste uke</option>
          <option value="month">Siste måned</option>
          <option value="quarter">Siste kvartal</option>
          <option value="year">Siste år</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totalt ordre</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">{data.overview.totalOrders}</p>
            </div>
            <div className="bg-nordvik-900/20 p-3 rounded-lg">
              <svg className="w-8 h-8 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fullførte</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">{data.overview.completedOrders}</p>
              <p className="text-sm text-green-400 mt-1">{data.overview.completionRate}% rate</p>
            </div>
            <div className="bg-green-900/20 p-3 rounded-lg">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kunder</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">{data.overview.totalCustomers}</p>
            </div>
            <div className="bg-blue-900/20 p-3 rounded-lg">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive fotografer</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">{data.overview.activePhotographers}</p>
            </div>
            <div className="bg-purple-900/20 p-3 rounded-lg">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Ordre Status Fordeling</h3>
          <div className="space-y-4">
            {data.ordersByStatus && data.ordersByStatus.length > 0 ? (
              data.ordersByStatus.map((item) => {
                const percentage = data.overview.totalOrders > 0 
                  ? Math.round((item.count / data.overview.totalOrders) * 100)
                  : 0
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.status}</span>
                      <span className="text-gray-300">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-dark-800 rounded-full h-2">
                      <div
                        className="bg-nordvik-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500">Ingen data tilgjengelig</p>
            )}
          </div>
        </div>

        {/* Photographer Performance */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Fotograf Ytelse</h3>
          <div className="space-y-4">
            {data.ordersByPhotographer && data.ordersByPhotographer.length > 0 ? (
              data.ordersByPhotographer
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((photographer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gray-400 text-gray-900' :
                        index === 2 ? 'bg-orange-600 text-orange-900' :
                        'bg-dark-700 text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-gray-300">{photographer.name}</span>
                    </div>
                    <span className="text-gray-400">{photographer.count} ordre</span>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">Ingen data tilgjengelig</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-dark-900 rounded-lg border border-dark-800 p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-6">Siste Aktivitet</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-dark-800">
                <th className="pb-3">Ordre</th>
                <th className="pb-3">Kunde</th>
                <th className="pb-3">Fotograf</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Dato</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.recentOrders && data.recentOrders.length > 0 ? (
                data.recentOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                    <td className="py-3">#{order.orderNumber}</td>
                    <td className="py-3">{order.customerName}</td>
                    <td className="py-3">{order.photographerName || '-'}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-nordvik-900/20 text-nordvik-400">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('nb-NO')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Ingen aktivitet ennå
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}