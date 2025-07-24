'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import { FileText, Send, Download, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

interface InvoiceDetail {
  id: string
  invoiceNumber: number
  status: string
  subtotal: number
  vatAmount: number
  total: number
  dueDate: string
  sentAt?: string
  paidDate?: string
  customer: {
    name: string
    email: string
    phone?: string
    invoiceAddress?: string
    invoiceZip?: string
    invoiceCity?: string
  }
  order: {
    orderNumber: number
    propertyAddress: string
    scheduledDate: string
  }
  lines: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    vatRate: number
  }>
  createdAt: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [params.id])

  async function loadInvoice() {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      if (!res.ok) throw new Error('Failed to load invoice')
      const data = await res.json()
      setInvoice(data)
    } catch (error) {
      console.error('Error loading invoice:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste faktura',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function sendInvoice() {
    if (!invoice || invoice.status !== 'DRAFT') return
    
    setIsSending(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST'
      })
      
      if (!res.ok) throw new Error('Failed to send invoice')
      
      showToast({
        type: 'success',
        title: 'Faktura sendt',
        message: `Faktura sendt til ${invoice.customer.email}`
      })
      
      await loadInvoice()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke sende faktura',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsSending(false)
    }
  }

  async function updateStatus(status: string, paidDate?: string) {
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, paidDate })
      })
      
      if (!res.ok) throw new Error('Failed to update status')
      
      showToast({
        type: 'success',
        title: 'Status oppdatert',
        message: `Faktura markert som ${getStatusLabel(status)}`
      })
      
      await loadInvoice()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke oppdatere status',
        message: 'Prøv igjen senere'
      })
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
    return new Date(date).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Faktura ikke funnet</h2>
          <button onClick={() => router.push('/orders')} className="btn-primary">
            Tilbake til ordre
          </button>
        </div>
      </div>
    )
  }

  // Sjekk om faktura er forfalt
  const isOverdue = invoice.status === 'SENT' && new Date(invoice.dueDate) < new Date()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/orders/${invoice.order.orderNumber}`)}
              className="text-gray-400 hover:text-gray-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-100">
              Faktura #{invoice.invoiceNumber}
            </h1>
            <span className={`status-badge ${getStatusColor(invoice.status)}`}>
              {getStatusLabel(invoice.status)}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            {invoice.status === 'DRAFT' && (
              <button
                onClick={sendInvoice}
                disabled={isSending}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sender...' : 'Send faktura'}
              </button>
            )}
            
            {invoice.status === 'SENT' && (
              <button
                onClick={() => updateStatus('PAID', new Date().toISOString())}
                className="btn-secondary flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Marker som betalt
              </button>
            )}
            
            <button
              onClick={() => showToast({
                type: 'info',
                title: 'Kommer snart',
                message: 'PDF-eksport er under utvikling'
              })}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Last ned PDF
            </button>
          </div>
        </div>
        
        {isOverdue && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-400 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Faktura er forfalt! Forfallsdato var {formatDate(invoice.dueDate)}
            </p>
          </div>
        )}
      </div>

      {/* Invoice content */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg">
        <div className="p-8">
          {/* Invoice header */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Faktura</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fakturanummer:</dt>
                  <dd className="text-gray-200">#{invoice.invoiceNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fakturadato:</dt>
                  <dd className="text-gray-200">{formatDate(invoice.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Forfallsdato:</dt>
                  <dd className="text-gray-200 font-medium">{formatDate(invoice.dueDate)}</dd>
                </div>
                {invoice.paidDate && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Betalt dato:</dt>
                    <dd className="text-green-400">{formatDate(invoice.paidDate)}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Faktura til</h3>
              <div className="text-gray-300">
                <p className="font-medium">{invoice.customer.name}</p>
                {invoice.customer.invoiceAddress && (
                  <>
                    <p>{invoice.customer.invoiceAddress}</p>
                    <p>
                      {invoice.customer.invoiceZip} {invoice.customer.invoiceCity}
                    </p>
                  </>
                )}
                <p className="mt-2">{invoice.customer.email}</p>
                {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
              </div>
            </div>
          </div>

          {/* Order reference */}
          <div className="bg-dark-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-400">
              Ordre #{invoice.order.orderNumber} - {invoice.order.propertyAddress}
            </p>
          </div>

          {/* Invoice lines */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 text-sm font-medium text-gray-400">Beskrivelse</th>
                <th className="text-center py-3 text-sm font-medium text-gray-400">Antall</th>
                <th className="text-right py-3 text-sm font-medium text-gray-400">Pris/stk</th>
                <th className="text-right py-3 text-sm font-medium text-gray-400">MVA</th>
                <th className="text-right py-3 text-sm font-medium text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={line.id} className="border-b border-dark-800">
                  <td className="py-4 text-gray-200">{line.description}</td>
                  <td className="py-4 text-center text-gray-300">{line.quantity}</td>
                  <td className="py-4 text-right text-gray-300">
                    {formatCurrency(Number(line.unitPrice))}
                  </td>
                  <td className="py-4 text-right text-gray-300">
                    {Number(line.vatRate)}%
                  </td>
                  <td className="py-4 text-right font-medium text-gray-200">
                    {formatCurrency(Number(line.totalPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sum eks. MVA:</span>
                  <span className="text-gray-200">{formatCurrency(Number(invoice.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MVA (25%):</span>
                  <span className="text-gray-200">{formatCurrency(Number(invoice.vatAmount))}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-dark-700">
                  <span className="text-gray-100">Å betale:</span>
                  <span className="text-gray-100">{formatCurrency(Number(invoice.total))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          {invoice.status === 'SENT' && (
            <div className="mt-8 pt-8 border-t border-dark-800">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">Betalingsinformasjon</h4>
              <p className="text-sm text-gray-400">
                Vennligst betal til konto: 1234.56.78900<br />
                Merk betalingen med fakturanummer: {invoice.invoiceNumber}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}