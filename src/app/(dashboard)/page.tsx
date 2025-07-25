'use client'

import { useState, useEffect } from 'react'
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, Package, DollarSign, PieChart as PieChartIcon, 
  Calendar, Users, Camera, ChevronDown 
} from 'lucide-react'
import { showToast } from '@/components/ui/Toast'

interface DashboardData {
  summary: {
    totalOrders: number
    completedOrders: number
    totalRevenue: number
    totalRevenueIncVat: number
    totalProfit: number
    totalPhotographerFee: number
    totalPke: number
    totalPki: number
    averageOrderValue: number
    profitMargin: number
  }
  chartData: Array<{
    name: string
    omsetning: number
    fortjeneste: number
    antallOrdre: number
  }>
  pieData: Array<{
    name: string
    value: number
    color: string
  }>
  ordersByStatus: Array<{
    status: string
    count: number
  }>
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

const MONTHS = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'year'>('month')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [showPeriodSelector, setShowPeriodSelector] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [period, year, month])

  async function loadDashboardData() {
    try {
      const params = new URLSearchParams({
        period,
        year: year.toString(),
        month: month.toString()
      })
      
      const res = await fetch(`/api/dashboard?${params}`)
      if (!res.ok) throw new Error('Failed to load dashboard data')
      
      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste dashboard',
        message: 'Prøv igjen senere'
      })
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Venter',
      ASSIGNED: 'Tildelt',
      IN_PROGRESS: 'Under arbeid',
      EDITING: 'Redigering',
      QUALITY_CONTROL: 'Kvalitetskontroll',
      READY_FOR_DELIVERY: 'Klar for levering',
      DELIVERED: 'Levert',
      COMPLETED: 'Fullført'
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Ingen data tilgjengelig</p>
      </div>
    )
  }

  const { summary, chartData, pieData } = data

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 p-3 rounded-lg border border-dark-700">
          <p className="text-gray-300 text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Antall') ? entry.value : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">Oversikt over din virksomhet</p>
      </div>

      {/* Period selector */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowPeriodSelector(!showPeriodSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-900 border border-dark-800 rounded-lg text-gray-300 hover:border-dark-700"
          >
            <Calendar className="w-4 h-4" />
            {period === 'month' 
              ? `${MONTHS[month - 1]} ${year}`
              : `År ${year}`
            }
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showPeriodSelector && (
            <div className="absolute top-full mt-2 bg-dark-900 border border-dark-800 rounded-lg shadow-lg p-4 z-10">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-3 py-1 rounded ${period === 'month' ? 'bg-nordvik-500 text-white' : 'bg-dark-800 text-gray-400'}`}
                >
                  Måned
                </button>
                <button
                  onClick={() => setPeriod('year')}
                  className={`px-3 py-1 rounded ${period === 'year' ? 'bg-nordvik-500 text-white' : 'bg-dark-800 text-gray-400'}`}
                >
                  År
                </button>
              </div>
              
              <div className="space-y-2">
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="input-field w-full"
                >
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                
                {period === 'month' && (
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="input-field w-full"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                )}
              </div>
              
              <button
                onClick={() => setShowPeriodSelector(false)}
                className="mt-4 w-full btn-primary"
              >
                Lukk
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Totale oppdrag</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {summary.totalOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.completedOrders} fullført
              </p>
            </div>
            <Package className="w-8 h-8 text-nordvik-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Omsetning</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(summary.totalRevenueIncVat)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(summary.totalRevenue)} eks. mva
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Fortjeneste</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(summary.totalProfit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.profitMargin.toFixed(1)}% margin
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Snitt ordrestørrelse</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(summary.averageOrderValue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                eks. mva
              </p>
            </div>
            <Camera className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line chart */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Omsetning og fortjeneste
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="omsetning" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Omsetning"
              />
              <Line 
                type="monotone" 
                dataKey="fortjeneste" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Fortjeneste"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Kostnadsfordeling
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-400">
                  {item.name}: {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order status */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Ordrestatus
          </h3>
          <div className="space-y-3">
            {data.ordersByStatus.map((item) => (
              <div key={item.status} className="flex justify-between items-center">
                <span className="text-gray-400">{getStatusLabel(item.status)}</span>
                <span className="text-gray-200 font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Mest populære produkter
          </h3>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} stk</p>
                </div>
                <span className="text-gray-200 font-medium">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}