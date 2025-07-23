'use client'

import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  async function loadAnalytics() {
    try {
      setIsLoading(true)
      setError(null)
      
      const res = await fetch(`/api/analytics?range=${dateRange}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      
      const data = await res.json()
      setStats(data)
    } catch (error: any) {
      console.error('Error loading analytics:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    } else if (growth < 0) {
      return (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    }
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Kunne ikke laste statistikk</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={loadAnalytics} className="btn-primary">
            Prøv igjen
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Laster statistikk...</p>
        </div>
      </div>
    )
  }

  // Beregn maks verdi for grafen
  const maxRevenue = Math.max(...(stats.monthlyData?.map((m: any) => m.revenue) || [1]))

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Statistikk</h1>
          <p className="text-gray-400 mt-1">Analyser ytelse og trender</p>
        </div>
        
        {/* Periode velger */}
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-field"
        >
          <option value="week">Siste 7 dager</option>
          <option value="month">Denne måneden</option>
          <option value="quarter">Dette kvartalet</option>
          <option value="year">Dette året</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Omsetning */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total omsetning</h3>
            <div className="p-2 bg-nordvik-900/20 rounded-lg">
              <svg className="w-5 h-5 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{formatCurrency(stats.revenue.current)}</p>
          <div className="flex items-center gap-2 mt-2">
            {getGrowthIcon(stats.revenue.growth)}
            <span className={`text-sm font-medium ${stats.revenue.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(stats.revenue.growth).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">fra forrige periode</span>
          </div>
        </div>

        {/* Antall ordre */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Antall ordre</h3>
            <div className="p-2 bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{stats.orders.current}</p>
          <div className="flex items-center gap-2 mt-2">
            {getGrowthIcon(stats.orders.growth)}
            <span className={`text-sm font-medium ${stats.orders.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(stats.orders.growth).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">fra forrige periode</span>
          </div>
        </div>

        {/* Gjennomsnittlig ordreverdi */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Snitt ordreverdi</h3>
            <div className="p-2 bg-purple-900/20 rounded-lg">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-100">{formatCurrency(stats.avgOrderValue.current)}</p>
          <div className="flex items-center gap-2 mt-2">
            {getGrowthIcon(stats.avgOrderValue.growth)}
            <span className={`text-sm font-medium ${stats.avgOrderValue.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(stats.avgOrderValue.growth).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">fra forrige periode</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Omsetning over tid */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Omsetning og antall oppdrag</h2>
          {stats.monthlyData && stats.monthlyData.length > 0 ? (
            <div className="h-64 flex items-end justify-between gap-2">
              {stats.monthlyData.map((month: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-dark-800 rounded-t relative overflow-hidden" 
                       style={{ height: `${(month.revenue / maxRevenue) * 100}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-nordvik-900 to-nordvik-700"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{month.month}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Ingen data tilgjengelig</p>
            </div>
          )}
        </div>

        {/* Ordrestatus fordeling */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Ordrestatus fordeling</h2>
          {stats.ordersByStatus ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Fullført</span>
                  <span className="text-sm font-medium text-gray-200">{stats.ordersByStatus.completed || 0}</span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" 
                       style={{ width: `${stats.orders.current > 0 ? (stats.ordersByStatus.completed / stats.orders.current) * 100 : 0}%` }}>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Under arbeid</span>
                  <span className="text-sm font-medium text-gray-200">{stats.ordersByStatus.inProgress || 0}</span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" 
                       style={{ width: `${stats.orders.current > 0 ? (stats.ordersByStatus.inProgress / stats.orders.current) * 100 : 0}%` }}>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Venter</span>
                  <span className="text-sm font-medium text-gray-200">{stats.ordersByStatus.pending || 0}</span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" 
                       style={{ width: `${stats.orders.current > 0 ? (stats.ordersByStatus.pending / stats.orders.current) * 100 : 0}%` }}>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-500">Ingen ordre ennå</p>
            </div>
          )}
        </div>
      </div>

      {/* Top lister */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top kunder */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg">
          <div className="p-6 border-b border-dark-800">
            <h2 className="text-lg font-semibold text-gray-200">Top kunder</h2>
          </div>
          <div className="p-6">
            {stats.topCustomers && stats.topCustomers.length > 0 ? (
              <div className="space-y-4">
                {stats.topCustomers.map((customer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-nordvik-900/20 rounded-full flex items-center justify-center text-sm font-semibold text-nordvik-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.orders} oppdrag</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-200">{formatCurrency(customer.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Ingen kunder ennå</p>
            )}
          </div>
        </div>

        {/* Top fotografer */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg">
          <div className="p-6 border-b border-dark-800">
            <h2 className="text-lg font-semibold text-gray-200">Top fotografer</h2>
          </div>
          <div className="p-6">
            {stats.topPhotographers && stats.topPhotographers.length > 0 ? (
              <div className="space-y-4">
                {stats.topPhotographers.map((photographer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-nordvik-900/20 rounded-full flex items-center justify-center text-sm font-semibold text-nordvik-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">{photographer.name}</p>
                        <p className="text-sm text-gray-500">{photographer.orders} oppdrag</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-200">{formatCurrency(photographer.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Ingen fotografer har fullført oppdrag ennå</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}