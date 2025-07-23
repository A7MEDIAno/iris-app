'use client'

import { useState, useEffect } from 'react'
import { useRealtimeUpdates } from '../../../hooks/useRealtimeUpdates'
import { RealtimeIndicator } from '../../../components/ui/RealtimeIndicator'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('month')
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Real-time updates
  const { isConnected, activeUsers, sendActivity } = useRealtimeUpdates({
    onOrderUpdate: (order) => {
      // Refresh stats når en ordre oppdateres
      loadAnalytics()
    }
  })

  useEffect(() => {
    loadAnalytics()
    
    // Send activity update
    sendActivity({
      status: 'online',
      currentPage: '/analytics'
    })
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

  // Eksporter rapport
  const exportReport = async () => {
    try {
      const res = await fetch(`/api/analytics/export?range=${dateRange}`)
      const blob = await res.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      showToast({
        type: 'success',
        title: 'Rapport eksportert',
        message: 'Rapporten har blitt lastet ned'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke eksportere',
        message: 'Prøv igjen senere'
      })
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
      {/* Header med real-time indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Statistikk</h1>
          <p className="text-gray-400 mt-1">Analyser ytelse og trender</p>
        </div>
        
        <div className="flex items-center gap-4">
          <RealtimeIndicator 
            isConnected={isConnected}
            activeUsers={activeUsers}
            currentPage="/analytics"
          />
          
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
          
          {/* Eksporter knapp */}
          <button
            onClick={exportReport}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Eksporter
          </button>
        </div>
      </div>

      {/* Live update indicator */}
      {isConnected && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="animate-pulse">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <p className="text-sm text-green-400">
            Statistikken oppdateres automatisk når nye ordre kommer inn
          </p>
        </div>
      )}

      {/* Resten av analytics siden forblir den samme... */}
      {/* KPI Cards, charts, etc. */}
    </div>
  )
}