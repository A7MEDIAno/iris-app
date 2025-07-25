'use client'

import { useState, useEffect } from 'react'
import { showToast } from '@/components/ui/Toast'
import { DollarSign, Calendar, Download, TrendingUp } from 'lucide-react'

interface IncomeData {
  totalEarned: number
  totalOrders: number
  periodEarnings: Array<{
    date: string
    amount: number
    orderCount: number
  }>
  orderDetails: Array<{
    orderNumber: number
    propertyAddress: string
    completedDate: string
    photographerFee: number
  }>
}

const MONTHS = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
]

export default function MyIncomePage() {
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    loadIncomeData()
  }, [year, month])

  async function loadIncomeData() {
    try {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString()
      })
      
      const res = await fetch(`/api/my-income?${params}`)
      if (!res.ok) throw new Error('Failed to load income data')
      
      const data = await res.json()
      setIncomeData(data)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke laste inntektsdata',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function downloadReport() {
    setIsDownloading(true)
    try {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString()
      })
      
      const res = await fetch(`/api/my-income/report?${params}`)
      if (!res.ok) throw new Error('Failed to download report')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fakturagrunnlag-${year}-${month.toString().padStart(2, '0')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showToast({
        type: 'success',
        title: 'Fakturagrunnlag lastet ned',
        message: 'Dokumentet er lagret i nedlastinger'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke laste ned',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsDownloading(false)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  if (!incomeData) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Min inntekt</h1>
          <p className="text-gray-400 mt-1">Oversikt over dine inntekter og fakturagrunnlag</p>
        </div>
        <button
          onClick={downloadReport}
          disabled={isDownloading || incomeData.totalOrders === 0}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Laster ned...' : 'Last ned fakturagrunnlag'}
        </button>
      </div>

      {/* Periode-velger */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input-field"
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistikk-kort */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total inntekt</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(incomeData.totalEarned)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {MONTHS[month - 1]} {year}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Antall oppdrag</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {incomeData.totalOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Fullførte oppdrag
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Snitt per oppdrag</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {incomeData.totalOrders > 0 
                  ? formatCurrency(incomeData.totalEarned / incomeData.totalOrders)
                  : formatCurrency(0)
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Gjennomsnittlig inntekt
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Detaljert liste */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden">
        <div className="p-6 border-b border-dark-800">
          <h3 className="text-lg font-semibold text-gray-100">Oppdragsdetaljer</h3>
        </div>
        
        {incomeData.orderDetails.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Ordre</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Adresse</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Fullført</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Honorar</th>
              </tr>
            </thead>
            <tbody>
              {incomeData.orderDetails.map((order, index) => (
                <tr key={index} className="border-b border-dark-800 last:border-0">
                  <td className="p-4 text-gray-300">#{order.orderNumber}</td>
                  <td className="p-4 text-gray-300">{order.propertyAddress}</td>
                  <td className="p-4 text-gray-300">
                    {new Date(order.completedDate).toLocaleDateString('nb-NO')}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-200">
                    {formatCurrency(order.photographerFee)}
                  </td>
                </tr>
              ))}
              <tr className="bg-dark-800">
                <td colSpan={3} className="p-4 text-right font-semibold text-gray-100">
                  Total:
                </td>
                <td className="p-4 text-right font-semibold text-gray-100">
                  {formatCurrency(incomeData.totalEarned)}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Ingen fullførte oppdrag i denne perioden
          </div>
        )}
      </div>
    </div>
  )
}