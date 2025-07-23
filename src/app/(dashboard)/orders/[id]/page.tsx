'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'images' | 'info' | 'comments'>('images')

  useEffect(() => {
    loadOrderData()
  }, [params.id])

  async function loadOrderData() {
    try {
      // Hent ordre
      const ordersRes = await fetch('/api/orders')
      const orders = await ordersRes.json()
      const currentOrder = orders.find((o: any) => o.id === params.id)
      
      if (!currentOrder) {
        router.push('/orders')
        return
      }
      
      setOrder(currentOrder)

      // Hent kunde
      const customersRes = await fetch('/api/customers')
      const customers = await customersRes.json()
      const orderCustomer = customers.find((c: any) => c.id === currentOrder.customerId)
      setCustomer(orderCustomer)
    } catch (error) {
      console.error('Error loading order:', error)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    onDrop: async (acceptedFiles) => {
      setIsUploading(true)
      
      // Opprett preview
      const newImages = acceptedFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }))
      
      setImages([...images, ...newImages])
      setIsUploading(false)
      
      // TODO: Last opp til server
    }
  })

  function getStatusColor(status: string) {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ASSIGNED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  function getStatusText(status: string) {
    const texts = {
      PENDING: 'Venter',
      ASSIGNED: 'Tildelt',
      IN_PROGRESS: 'Under arbeid',
      COMPLETED: 'Fullført',
      CANCELLED: 'Kansellert'
    }
    return texts[status] || status
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Laster...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="text-gray-500 hover:text-gray-700 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tilbake til oppdrag
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Oppdrag #{order.orderNumber}
            </h1>
            <p className="text-gray-600">{order.propertyAddress}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            {order.priority === 'HIGH' && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Høy prioritet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('images')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'images'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bilder ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informasjon
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Kommentarer
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          {/* Upload area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Slipp bildene her...'
                : 'Dra bilder hit eller klikk for å velge'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG opptil 50MB per bilde
            </p>
          </div>

          {/* Image grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 text-white p-2 bg-red-600 rounded-full hover:bg-red-700 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 rounded-b-lg">
                    <p className="text-white text-xs truncate">{image.name}</p>
                    <p className="text-white text-xs opacity-75">{formatFileSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-600">Ingen bilder lastet opp ennå</p>
            </div>
          )}

          {/* Action buttons */}
          {images.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {images.length} {images.length === 1 ? 'bilde' : 'bilder'} lastet opp
              </p>
              <div className="space-x-4">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Last ned alle
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Send til redigering
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kunde info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4">Kundeinformasjon</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Firma</p>
                <p className="font-medium">{customer?.name || 'Ikke angitt'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">E-post</p>
                <p className="font-medium">{customer?.email || 'Ikke angitt'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{customer?.phone || 'Ikke angitt'}</p>
              </div>
            </div>
          </div>

          {/* Oppdragsinfo */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-4">Oppdragsinformasjon</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium">{order.propertyAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Boligtype</p>
                <p className="font-medium">{order.propertyType || 'Ikke angitt'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Planlagt dato</p>
                <p className="font-medium">
                  {new Date(order.scheduledDate).toLocaleDateString('nb-NO')}
                  {order.scheduledTime && ` kl. ${order.scheduledTime}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Opprettet</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('nb-NO')}
                </p>
              </div>
            </div>
          </div>

          {/* Notater */}
          {order.notes && (
            <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Notater</h3>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Kommentarer</h3>
          <p className="text-gray-500 text-center py-8">Ingen kommentarer ennå</p>
        </div>
      )}
    </div>
  )
}