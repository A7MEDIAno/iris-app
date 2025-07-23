'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ImageUploader } from '../../../../components/images/ImageUploader'
import { ImageGallery } from '../../../../components/images/ImageGallery'
import { showToast } from '../../../../components/ui/Toast'

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
    name: string
    email: string
    phone?: string
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

  useEffect(() => {
    loadOrder()
    loadTags()
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

  async function updateOrderStatus(newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      await loadOrder()
      showToast({
        type: 'success',
        title: 'Status oppdatert',
        message: `Ordre status endret til ${getStatusLabel(newStatus)}`
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke oppdatere status',
        message: 'Prøv igjen senere'
      })
    }
  }

  async function handleImageUpload(uploadedImages: any[]) {
    await loadOrder() // Refresh order data
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
      
      await loadOrder() // Refresh order data
      
      // Fjern fra selectedImages hvis den var valgt
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
    { id: 'images', label: 'Bilder', icon: '📸', count: order.images.length },
    { id: 'delivery', label: 'Levering', icon: '📦' },
    { id: 'activity', label: 'Aktivitet', icon: '📝' }
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
                        onChange={(e) => updateOrderStatus(e.target.value)}
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
                {order.photographer ? (
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Navn</dt>
                      <dd className="text-gray-200">{order.photographer.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">E-post</dt>
                      <dd className="text-gray-200">{order.photographer.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Telefon</dt>
                      <dd className="text-gray-200">{order.photographer.phone || 'Ikke oppgitt'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-gray-500">Ingen fotograf tildelt</p>
                )}
              </div>
            </div>
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