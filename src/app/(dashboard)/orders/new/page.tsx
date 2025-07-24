'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import { Package, Calendar, MapPin, User, FileText, AlertCircle } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
}

interface Product {
  id: string
  name: string
  description?: string
  category?: string
  priceExVat: number
  vatRate: number
  pke: number
  pki: number
  photographerFee: number
  isActive: boolean
}

interface SelectedProduct {
  productId: string
  quantity: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({})
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  
  const [formData, setFormData] = useState({
    customerId: '',
    propertyAddress: '',
    propertyType: '',
    scheduledDate: '',
    scheduledTime: '12:00',
    priority: 'NORMAL',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Hent kunder
      const customersRes = await fetch('/api/customers')
      if (customersRes.ok) {
        const data = await customersRes.json()
        setCustomers(data.customers || [])
      }

      // Hent produkter
      const productsRes = await fetch('/api/products?activeOnly=true')
      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || [])
        setGroupedProducts(data.groupedProducts || {})
      }
    } catch (error) {
      console.error('Error loading data:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste data',
        message: 'Prøv igjen senere'
      })
    }
  }

  function toggleProduct(productId: string) {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.productId === productId)
      if (existing) {
        return prev.filter(p => p.productId !== productId)
      } else {
        return [...prev, { productId, quantity: 1 }]
      }
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return
    setSelectedProducts(prev =>
      prev.map(p => p.productId === productId ? { ...p, quantity } : p)
    )
  }

  // Beregn totaler
  const calculateTotals = () => {
    let subtotal = 0
    let totalPke = 0
    let totalPki = 0
    let totalPhotographerFee = 0

    selectedProducts.forEach(({ productId, quantity }) => {
      const product = products.find(p => p.id === productId)
      if (product) {
        subtotal += Number(product.priceExVat) * quantity
        totalPke += Number(product.pke) * quantity
        totalPki += Number(product.pki) * quantity
        totalPhotographerFee += Number(product.photographerFee) * quantity
      }
    })

    const vatAmount = subtotal * 0.25
    const total = subtotal + vatAmount
    const totalCosts = totalPke + totalPki + totalPhotographerFee
    const profit = subtotal - totalCosts

    return {
      subtotal,
      vatAmount,
      total,
      totalPke,
      totalPki,
      totalPhotographerFee,
      totalCosts,
      profit,
      profitMargin: subtotal > 0 ? (profit / subtotal) * 100 : 0
    }
  }

  const totals = calculateTotals()

  async function handleSubmit() {
    if (!formData.customerId) {
      showToast({
        type: 'error',
        title: 'Mangler kunde',
        message: 'Du må velge en kunde'
      })
      return
    }

    if (!formData.propertyAddress) {
      showToast({
        type: 'error',
        title: 'Mangler adresse',
        message: 'Du må fylle inn eiendomsadresse'
      })
      return
    }

    if (selectedProducts.length === 0) {
      showToast({
        type: 'error',
        title: 'Ingen produkter valgt',
        message: 'Du må velge minst ett produkt'
      })
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          products: selectedProducts.map(sp => ({
            productId: sp.productId,
            quantity: sp.quantity
          }))
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Kunne ikke opprette ordre')
      }

      const order = await res.json()
      
      showToast({
        type: 'success',
        title: 'Ordre opprettet',
        message: `Ordre #${order.orderNumber} er opprettet`
      })
      
      router.push('/orders')
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Feil ved opprettelse',
        message: error instanceof Error ? error.message : 'Prøv igjen senere'
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

  const getCategoryIcon = (category: string | null) => {
    const icons: Record<string, any> = {
      'foto': '📷',
      'video': '🎥',
      'drone': '🚁',
      'plantegning': '📐',
      'styling': '🏠',
      'tillegg': '➕'
    }
    return icons[category || ''] || '📦'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Nytt oppdrag</h1>
        <p className="text-gray-400 mt-1">Opprett nytt fotograferingsoppdrag</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Venstre kolonne - Hovedinfo */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Grunnleggende info */}
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-nordvik-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-100">Oppdragsinformasjon</h2>
            </div>
            
            <div className="space-y-4">
              {/* Kunde */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kunde *
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="input-field w-full"
                  required
                >
                  <option value="">Velg kunde</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Du må opprette en kunde først
                  </p>
                )}
              </div>

              {/* Eiendomsadresse */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Eiendomsadresse *
                </label>
                <input
                  type="text"
                  value={formData.propertyAddress}
                  onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                  className="input-field w-full"
                  placeholder="Storgata 1, 0123 Oslo"
                  required
                />
              </div>

              {/* Boligtype */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Boligtype
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">Velg type</option>
                  <option value="Enebolig">Enebolig</option>
                  <option value="Leilighet">Leilighet</option>
                  <option value="Rekkehus">Rekkehus</option>
                  <option value="Hytte">Hytte</option>
                  <option value="Næringseiendom">Næringseiendom</option>
                </select>
              </div>

              {/* Dato og tid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dato *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tidspunkt
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {/* Prioritet */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prioritet
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Høy prioritet</option>
                  <option value="URGENT">Haster</option>
                </select>
              </div>

              {/* Notater */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notater
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Ekstra informasjon om oppdraget..."
                />
              </div>
            </div>
          </div>

          {/* Produkter */}
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-nordvik-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-100">Velg produkter *</h2>
            </div>
            
            {products.length === 0 ? (
              <p className="text-gray-500">
                Ingen produkter tilgjengelig. Opprett produkter først.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">
                      {getCategoryIcon(category)} {category || 'Ukategorisert'}
                    </h3>
                    <div className="space-y-2">
                      {categoryProducts.map((product) => {
                        const selected = selectedProducts.find(p => p.productId === product.id)
                        return (
                          <div
                            key={product.id}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selected
                                ? 'border-nordvik-500 bg-nordvik-900/20'
                                : 'border-dark-700 hover:border-dark-600'
                            }`}
                          >
                            <div className="flex items-start">
                              <input
                                type="checkbox"
                                checked={!!selected}
                                onChange={() => toggleProduct(product.id)}
                                className="mt-1 mr-3 h-4 w-4 text-nordvik-500 focus:ring-nordvik-500 border-gray-600 rounded"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-100">{product.name}</p>
                                    {product.description && (
                                      <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <p className="font-semibold text-gray-100">
                                      {formatCurrency(Number(product.priceExVat))}
                                    </p>
                                    <p className="text-xs text-gray-500">eks. mva</p>
                                  </div>
                                </div>
                                
                                {selected && (
                                  <div className="mt-3 flex items-center">
                                    <label className="text-sm text-gray-400 mr-2">Antall:</label>
                                    <input
                                      type="number"
                                      value={selected.quantity}
                                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                                      min="1"
                                      className="w-20 px-2 py-1 bg-dark-800 border border-dark-700 rounded text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Høyre kolonne - Sammendrag */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Prissammendrag */}
            <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Sammendrag</h2>
              
              {selectedProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">Ingen produkter valgt</p>
              ) : (
                <div className="space-y-4">
                  {/* Valgte produkter */}
                  <div className="space-y-2">
                    {selectedProducts.map(({ productId, quantity }) => {
                      const product = products.find(p => p.id === productId)
                      if (!product) return null
                      
                      return (
                        <div key={productId} className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {product.name} {quantity > 1 && `(${quantity}x)`}
                          </span>
                          <span className="text-gray-200">
                            {formatCurrency(Number(product.priceExVat) * quantity)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Totaler */}
                  <div className="border-t border-dark-700 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sum eks. MVA</span>
                      <span className="text-gray-200">{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">MVA (25%)</span>
                      <span className="text-gray-400">{formatCurrency(totals.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-dark-700">
                      <span className="text-gray-100">Total</span>
                      <span className="text-gray-100">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fortjeneste-oversikt */}
            {selectedProducts.length > 0 && (
              <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
                <h3 className="text-sm font-semibold text-gray-100 mb-3">Fortjeneste</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Inntekt</span>
                    <span className="text-gray-400">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">- Kostnader</span>
                    <span className="text-gray-400">-{formatCurrency(totals.totalCosts)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-dark-700">
                    <span className={totals.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      Fortjeneste
                    </span>
                    <span className={totals.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(totals.profit)} ({totals.profitMargin.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || selectedProducts.length === 0}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Oppretter...' : 'Opprett oppdrag'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/orders')}
                className="w-full btn-secondary"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}