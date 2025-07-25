'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ImageUploader } from '@/components/images/ImageUploader'
import { ImageGallery } from '@/components/images/ImageGallery'
import { showToast } from '@/components/ui/Toast'
import { Package, DollarSign, TrendingUp, PieChart, Receipt, FileText, Calculator } from 'lucide-react'

interface OrderProduct {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    id: string
    name: string
    description?: string
    category?: string
    sku?: string
  }
}

interface OrderDetail {
  id: string
  orderNumber: number
  status: string
  priority: string
  propertyAddress: string
  propertyType?: string
  scheduledDate: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  photographer?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  orderProducts: OrderProduct[]
  totalAmount?: number
  vatAmount?: number
  photographerFee?: number
  companyProfit?: number
  calculations?: {
    subtotal: number
    vatAmount: number
    totalIncVat: number
    photographerFee: number
    companyProfit: number
    profitMargin: number
  }
  invoice?: {
    id: string
    invoiceNumber: number
    status: string
  }
  images: Array<{
    id: string
    url: string
    thumbnailUrl?: string
    originalName: string
    size: number
    width?: number | null
    height?: number | null
    status: string
    tags: Array<{
      id: string
      tag: {
        id: string
        name: string
        icon?: string
      }
    }>
  }>
  createdAt: string
  updatedAt: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [selectedImages, setSelectedImages] = useState<any[]>([])
  const [photographers, setPhotographers] = useState<any[]>([])
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)

  useEffect(() => {
    loadOrder()
    loadTags()
    loadPhotographers()
  }, [params.id])

  async function loadOrder() {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      if (!res.ok) throw new Error('Failed to load order')
      const data = await res.json()
      setOrder(data)
    } catch (error) {
      console.error('Error loading order:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste ordre',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadTags() {
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setAvailableTags(data)
      }
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  async function loadPhotographers() {
    try {
      const res = await fetch('/api/users?role=PHOTOGRAPHER')
      if (res.ok) {
        const data = await res.json()
        setPhotographers(data.users || [])
      }
    } catch (error) {
      console.error('Error loading photographers:', error)
    }
  }

  async function updateOrder(updates: any) {
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!res.ok) throw new Error('Failed to update order')
      
      await loadOrder()
      
      if (updates.status) {
        showToast({
          type: 'success',
          title: 'Status oppdatert',
          message: `Ordre status endret til ${getStatusLabel(updates.status)}`
        })
      }
      if (updates.photographerId !== undefined) {
        showToast({
          type: 'success',
          title: 'Fotograf oppdatert',
          message: updates.photographerId ? 'Fotograf tildelt' : 'Fotograf fjernet'
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke oppdatere',
        message: 'Prøv igjen senere'
      })
    }
  }

  async function createInvoice() {
    if (!order) return
    
    setIsCreatingInvoice(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Kunne ikke opprette faktura')
      }
      
      const invoice = await res.json()
      
      showToast({
        type: 'success',
        title: 'Faktura opprettet',
        message: `Faktura #${invoice.invoiceNumber} er opprettet`
      })
      
      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke opprette faktura',
        message: error instanceof Error ? error.message : 'Prøv igjen senere'
      })
    } finally {
      setIsCreatingInvoice(false)
    }
  }

  async function handleImageUpload(uploadedImages: any[]) {
    await loadOrder()
  }

  async function handleTagUpdate(imageId: string, tagIds: string[]) {
    try {
      const res = await fetch(`/api/images/${imageId}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds })
      })

      if (!res.ok) throw new Error('Failed to update tags')
      await loadOrder()
    } catch (error) {
      console.error('Error updating tags:', error)
      throw error
    }
  }

  async function handleImageDelete(imageId: string) {
    try {
      const res = await fetch(`/api/images/upload?id=${imageId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete image')
      }
      
      await loadOrder()
      setSelectedImages(prev => prev.filter(img => img.id !== imageId))
    } catch (error: any) {
      console.error('Error deleting image:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke slette bilde',
        message: error.message || 'Prøv igjen senere'
      })
      throw error
    }
  }

  async function downloadImages() {
    try {
      const imageIds = selectedImages.length > 0 
        ? selectedImages.map(img => img.id)
        : order?.images.map(img => img.id) || []

      if (imageIds.length === 0) {
        showToast({
          type: 'warning',
          title: 'Ingen bilder å laste ned'
        })
        return
      }

      showToast({
        type: 'info',
        title: 'Forbereder nedlasting...',
        message: 'Dette kan ta litt tid for mange bilder'
      })

      const res = await fetch('/api/images/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds, orderId: params.id })
      })

      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ordre-${order?.orderNumber}-bilder.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showToast({
        type: 'success',
        title: 'Nedlasting startet',
        message: 'Bildene lastes ned som ZIP-fil'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Nedlasting feilet',
        message: 'Kunne ikke laste ned bilder'
      })
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
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
    return labels[status] || status
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-900/20 text-yellow-400 border-yellow-800',
      ASSIGNED: 'bg-blue-900/20 text-blue-400 border-blue-800',
      IN_PROGRESS: 'bg-purple-900/20 text-purple-400 border-purple-800',
      EDITING: 'bg-indigo-900/20 text-indigo-400 border-indigo-800',
      QUALITY_CONTROL: 'bg-orange-900/20 text-orange-400 border-orange-800',
      READY_FOR_DELIVERY: 'bg-cyan-900/20 text-cyan-400 border-cyan-800',
      DELIVERED: 'bg-teal-900/20 text-teal-400 border-teal-800',
      COMPLETED: 'bg-green-900/20 text-green-400 border-green-800',
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

  const getProfitColor = (margin: number) => {
    if (margin < 0) return 'text-red-500'
    if (margin < 20) return 'text-yellow-500'
    if (margin < 40) return 'text-blue-500'
    return 'text-green-500'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Ordre ikke funnet</h2>
          <button onClick={() => router.push('/orders')} className="btn-primary">
            Tilbake til ordre
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Oversikt', icon: '📋' },
    { id: 'economy', label: 'Økonomi', icon: '💰' },
    { id: 'images', label: 'Bilder', icon: '📸', count: order.images.length },
    { id: 'delivery', label: 'Levering', icon: '📦' },
    { id: 'activity', label: 'Aktivitet', icon: '📝' }
  ]

  // Beregn kostnadsprosenter for visualisering
  const costs = order.calculations || {
    subtotal: 0,
    vatAmount: 0,
    totalIncVat: 0,
    photographerFee: 0,
    companyProfit: 0,
    profitMargin: 0
  }

  const totalCosts = costs.photographerFee + (costs.subtotal - costs.companyProfit - costs.photographerFee)
  const costBreakdown = [
    { 
      label: 'Fotografhonorar', 
      amount: costs.photographerFee, 
      percentage: costs.subtotal > 0 ? (costs.photographerFee / costs.subtotal) * 100 : 0,
      color: 'bg-blue-500'
    },
    { 
      label: 'Andre kostnader', 
      amount: totalCosts - costs.photographerFee, 
      percentage: costs.subtotal > 0 ? ((totalCosts - costs.photographerFee) / costs.subtotal) * 100 : 0,
      color: 'bg-purple-500'
    },
    { 
      label: 'Fortjeneste', 
      amount: costs.companyProfit, 
      percentage: costs.profitMargin,
      color: costs.companyProfit >= 0 ? 'bg-green-500' : 'bg-red-500'
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/orders')}
            className="text-gray-400 hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-100">Ordre #{order.orderNumber}</h1>
          <span className={`status-badge ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
          {order.invoice && (
            <span className="text-sm text-gray-400">
              Faktura #{order.invoice.invoiceNumber}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {order.propertyAddress}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(order.scheduledDate).toLocaleDateString('nb-NO')}
          </div>
          {costs.totalIncVat > 0 && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {formatCurrency(costs.totalIncVat)}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-900 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-all
              ${activeTab === tab.id 
                ? 'bg-nordvik-900 text-white' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-dark-700 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg">
        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Ordreinformasjon</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrder({ status: e.target.value })}
                        className="input-field"
                      >
                        <option value="PENDING">Venter</option>
                        <option value="ASSIGNED">Tildelt</option>
                        <option value="IN_PROGRESS">Under arbeid</option>
                        <option value="EDITING">Redigering</option>
                        <option value="QUALITY_CONTROL">Kvalitetskontroll</option>
                        <option value="READY_FOR_DELIVERY">Klar for levering</option>
                        <option value="DELIVERED">Levert</option>
                        <option value="COMPLETED">Fullført</option>
                        <option value="CANCELLED">Kansellert</option>
                      </select>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Prioritet</dt>
                    <dd className="text-gray-200">{order.priority}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Eiendomstype</dt>
                    <dd className="text-gray-200">{order.propertyType || 'Ikke spesifisert'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Opprettet</dt>
                    <dd className="text-gray-200">
                      {new Date(order.createdAt).toLocaleDateString('nb-NO')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Customer info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Kunde</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Navn</dt>
                    <dd className="text-gray-200">{order.customer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">E-post</dt>
                    <dd className="text-gray-200">{order.customer.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Telefon</dt>
                    <dd className="text-gray-200">{order.customer.phone || 'Ikke oppgitt'}</dd>
                  </div>
                </dl>
              </div>

              {/* Photographer info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">Fotograf</h3>
                <div>
                  <select
                    value={order.photographer?.id || ''}
                    onChange={(e) => updateOrder({ photographerId: e.target.value || null })}
                    className="input-field w-full mb-3"
                  >
                    <option value="">Ingen fotograf tildelt</option>
                    {photographers.map((photographer) => (
                      <option key={photographer.id} value={photographer.id}>
                        {photographer.name}
                      </option>
                    ))}
                  </select>
                  
                  {order.photographer && (
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm text-gray-500">E-post</dt>
                        <dd className="text-gray-200">{order.photographer.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">Telefon</dt>
                        <dd className="text-gray-200">{order.photographer.phone || 'Ikke oppgitt'}</dd>
                      </div>
                    </dl>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Economy tab */}
        {activeTab === 'economy' && (
          <div className="p-6">
            {order.orderProducts && order.orderProducts.length > 0 ? (
              <div className="space-y-8">
                {/* Produktliste */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-nordvik-400" />
                    Bestilte produkter
                  </h3>
                  <div className="bg-dark-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-700">
                          <th className="text-left p-4 text-sm font-medium text-gray-400">Produkt</th>
                          <th className="text-center p-4 text-sm font-medium text-gray-400">Antall</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-400">Pris/stk</th>
                          <th className="text-right p-4 text-sm font-medium text-gray-400">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderProducts.map((item) => (
                          <tr key={item.id} className="border-b border-dark-700 last:border-0">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-gray-200">{item.product.name}</p>
                                {item.product.description && (
                                  <p className="text-sm text-gray-500 mt-1">{item.product.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="text-center p-4 text-gray-300">{item.quantity}</td>
                            <td className="text-right p-4 text-gray-300">
                              {formatCurrency(Number(item.unitPrice))}
                            </td>
                            <td className="text-right p-4 font-medium text-gray-200">
                              {formatCurrency(Number(item.totalPrice))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Økonomisk oversikt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Totaler */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                      <Calculator className="w-5 h-5 mr-2 text-nordvik-400" />
                      Prissammendrag
                    </h3>
                    <div className="bg-dark-800 rounded-lg p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sum eks. MVA</span>
                        <span className="text-gray-200">{formatCurrency(costs.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">MVA (25%)</span>
                        <span className="text-gray-400">{formatCurrency(costs.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-3 border-t border-dark-700">
                        <span className="text-gray-100">Total inkl. MVA</span>
                        <span className="text-gray-100">{formatCurrency(costs.totalIncVat)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fortjeneste */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-nordvik-400" />
                      Fortjeneste-analyse
                    </h3>
                    <div className="bg-dark-800 rounded-lg p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Inntekt</span>
                        <span className="text-gray-200">{formatCurrency(costs.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">- Fotografhonorar</span>
                        <span className="text-gray-400">-{formatCurrency(costs.photographerFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">- Andre kostnader</span>
                        <span className="text-gray-400">-{formatCurrency(totalCosts - costs.photographerFee)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-3 border-t border-dark-700">
                        <span className={getProfitColor(costs.profitMargin)}>Fortjeneste</span>
                        <div className="text-right">
                          <p className={getProfitColor(costs.profitMargin)}>
                            {formatCurrency(costs.companyProfit)}
                          </p>
                          <p className={`text-sm ${getProfitColor(costs.profitMargin)}`}>
                            {costs.profitMargin.toFixed(1)}% margin
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kostnadsfordeling */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-nordvik-400" />
                    Kostnadsfordeling
                  </h3>
                  <div className="bg-dark-800 rounded-lg p-6">
                    <div className="space-y-4">
                      {costBreakdown.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">{item.label}</span>
                            <span className="text-sm text-gray-300">
                              {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-dark-700 rounded-full h-2">
                            <div
                              className={`${item.color} h-2 rounded-full transition-all`}
                              style={{ width: `${Math.abs(item.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Ingen produkter på denne ordren</p>
              </div>
            )}
          </div>
        )}

        {/* Images tab */}
        {activeTab === 'images' && (
          <div className="p-6">
            {/* Upload section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Last opp bilder</h3>
              <ImageUploader 
                orderId={order.id} 
                onUploadComplete={handleImageUpload}
              />
            </div>

            {/* Gallery section */}
            {order.images.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">
                    Bilder ({order.images.length})
                  </h3>
                  <button
                    onClick={downloadImages}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Last ned {selectedImages.length > 0 ? `(${selectedImages.length} valgt)` : 'alle'}
                  </button>
                </div>
                
                <ImageGallery
                  images={order.images}
                  onTagUpdate={handleTagUpdate}
                  onImageSelect={setSelectedImages}
                  onImageDelete={handleImageDelete}
                  availableTags={availableTags}
                />
              </div>
            )}
          </div>
        )}

        {/* Delivery tab */}
        {activeTab === 'delivery' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Leveringsinformasjon</h3>
            <p className="text-gray-400">Leveringsfunksjonalitet kommer snart...</p>
          </div>
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Aktivitetslogg</h3>
            <p className="text-gray-400">Aktivitetslogg kommer snart...</p>
          </div>
        )}
      </div>
    </div>
  )
}