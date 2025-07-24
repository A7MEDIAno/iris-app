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
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  async function loadAnalytics() {
    try {
      // Bruk riktig endpoint med period, ikke range
      const res = await fetch(`/api/analytics?period=${period}`)
      if (!res.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste statistikk',
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
        <div className="text-center">
          <p className="text-gray-400 mb-4">Kunne ikke laste statistikk</p>
          <button onClick={loadAnalytics} className="btn-primary">
            Prøv igjen
          </button>
        </div>
      </div>
    )
  }

  // Resten av komponenten forblir lik...
  const completionData = [
    { name: 'Fullført', value: data.overview.completedOrders },
    { name: 'Aktive', value: data.overview.totalOrders - data.overview.completedOrders }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Statistikk</h1>
          <p className="text-gray-400 mt-1">Detaljert oversikt over ytelse og aktivitet</p>
        </div>