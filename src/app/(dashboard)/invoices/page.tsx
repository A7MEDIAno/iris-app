'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import { Receipt, Calendar, DollarSign, FileText, Plus, Filter } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: number
  status: string
  total: number
  subtotal: number
  vatAmount: number
  dueDate: string
  paidDate?: string
  sentAt?: string
  customer: {
    id: string
    name: string
    email: string
  }
  order?: {
    orderNumber: number
    propertyAddress: string
  }
  periodStart?: string
  periodEnd?: string
  orderCount?: number
  createdAt: string
}

const MONTHS = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
]

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  
  // For periode-faktura
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadInvoices()
    loadCustomers()
  }, [filter])

  async function loadInvoices() {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      
      const res = await fetch(`/api/invoices?${params}`)
      if (!res.ok) throw new Error('Failed to load invoices')
      
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste fakturaer',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCustomers() {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  async function createPeriodInvoice() {
    if (!selectedCustomerId) {
      showToast({
        type: 'error',
        title: 'Velg kunde',
        message: 'Du må velge en kunde for å opprette faktura'
      })
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/invoices/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          year: selectedYear,
          month: selectedMonth
        })
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Kunne ikke opprette faktura')
      }
      
      const invoice = await res.json()
      
      showToast({
        type: 'success',
        title: 'Faktura opprettet',
        message: `Faktura #${invoice.invoiceNumber} for ${invoice.orderCount} ordre`
      })
      
      setShowCreateModal(false)
      await loadInvoices()
      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke opprette faktura',
        message: error instanceof Error ? error.message : 'Prøv igjen senere'
      })
    } finally {
      setIsCreating(false)
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      DRAFT: 'Kladd',
      SENT: 'Sendt',
      PAID: 'Betalt',
      OVERDUE: 'Forfalt',
      CANCELLED: 'Kansellert'
    }
    return labels[status] || status
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-900/20 text-gray-400 border-gray-800',
      SENT: 'bg-blue-900/20 text-blue-400 border-blue-800',
      PAID: 'bg-green-900/20 text-green-400 border-green-800',
      OVERDUE: 'bg-red-900/20 text-red-400 border-red-800',
      CANCELLED: 'bg-red-900/20 text-red-400 border-red-800'
    }
    return colors[status] || 'bg-gray-900/20 text-gray-400 border-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nb-NO')
  }

  // Beregn statistikk
  const stats = {
    total: invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
    unpaid: invoices
      .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + Number(inv.total), 0),
    overdue: invoices
      .filter(inv => inv.status === 'OVERDUE')
      .reduce((sum, inv) => sum + Number(inv.total), 0),
    count: {
      draft: invoices.filter(inv => inv.status === 'DRAFT').length,
      sent: invoices.filter(inv => inv.status === 'SENT').length,
      paid: invoices.filter(inv => inv.status === 'PAID').length,
      overdue: invoices.filter(inv => inv.status === 'OVERDUE').length
    }
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
          <h1 className="text-3xl font-bold text-gray-100">Fakturaer</h1>
          <p className="text-gray-400 mt-1">Oversikt over alle fakturaer</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Opprett månedsfaktura
        </button>
      </div>

      {/* Statistikk */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total fakturert</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(stats.total)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Ubetalt</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(stats.unpaid)}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Forfalt</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(stats.overdue)}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Sendt</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {stats.count.sent}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.count.paid} betalt
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {['all', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status 
                    ? 'bg-nordvik-500 text-white' 
                    : 'bg-dark-800 text-gray-400 hover:text-gray-300'
                }`}
              >
                {status === 'all' ? 'Alle' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fakturaliste */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-800">
              <th className="text-left p-4 text-sm font-medium text-gray-400">Faktura</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Kunde</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Periode</th>
              <th className="text-center p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right p-4 text-sm font-medium text-gray-400">Beløp</th>
              <th className="text-right p-4 text-sm font-medium text-gray-400">Forfallsdato</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr 
                key={invoice.id} 
                className="border-b border-dark-800 last:border-0 hover:bg-dark-800 cursor-pointer"
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <td className="p-4">
                  <p className="font-medium text-gray-200">#{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-500">
                    {invoice.orderCount ? `${invoice.orderCount} ordre` : 'Enkeltordre'}
                  </p>
                </td>
                <td className="p-4">
                  <p className="text-gray-200">{invoice.customer.name}</p>
                  <p className="text-sm text-gray-500">{invoice.customer.email}</p>
                </td>
                <td className="p-4">
                  {invoice.periodStart && invoice.periodEnd ? (
                    <p className="text-gray-300">
                      {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                    </p>
                  ) : invoice.order ? (
                    <p className="text-gray-300">
                      Ordre #{invoice.order.orderNumber}
                    </p>
                  ) : (
                    <p className="text-gray-500">-</p>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <p className="font-medium text-gray-200">
                    {formatCurrency(Number(invoice.total))}
                  </p>
                  <p className="text-sm text-gray-500">
                    eks. mva {formatCurrency(Number(invoice.subtotal))}
                  </p>
                </td>
                <td className="p-4 text-right text-gray-300">
                  {formatDate(invoice.dueDate)}
                  {invoice.paidDate && (
                    <p className="text-sm text-green-500">
                      Betalt {formatDate(invoice.paidDate)}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Ingen fakturaer opprettet ennå'
                : `Ingen ${getStatusLabel(filter).toLowerCase()} fakturaer`
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal for ny periodefaktura */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Opprett månedsfaktura
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kunde *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Velg kunde</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    År
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="input-field w-full"
                  >
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Måned
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="input-field w-full"
                  >
                    {MONTHS.map((month, i) => (
                      <option key={i} value={i + 1}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-sm text-gray-400">
                Dette vil opprette en samle-faktura for alle fullførte ordre i {MONTHS[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
                disabled={isCreating}
              >
                Avbryt
              </button>
              <button
                onClick={createPeriodInvoice}
                className="btn-primary flex-1"
                disabled={isCreating || !selectedCustomerId}
              >
                {isCreating ? 'Oppretter...' : 'Opprett faktura'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}