'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Customer, Product } from '../../../../types'

export default function NewOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  // For totalberegning
  const totalPrice = selectedProducts.reduce((sum, productId) => {
    const product = products.find(p => p.id === productId)
    return sum + (product ? Number(product.priceExVat) : 0)
  }, 0)
  const totalPriceIncVat = totalPrice * 1.25

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Hent kunder
      const customersRes = await fetch('/api/customers')
      const customersData = await customersRes.json()
      setCustomers(customersData)

      // Hent produkter
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      setProducts(productsData.filter((p: Product) => p.isActive))
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  function toggleProduct(productId: string) {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (selectedProducts.length === 0) {
      setError('Du må velge minst ett produkt')
      return
    }
    
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      customerId: formData.get('customerId') as string,
      propertyAddress: formData.get('propertyAddress') as string,
      propertyType: formData.get('propertyType') as string,
      scheduledDate: formData.get('scheduledDate') as string,
      scheduledTime: formData.get('scheduledTime') as string,
      priority: formData.get('priority') as string || 'NORMAL',
      notes: formData.get('notes') as string,
      products: selectedProducts,
      totalPrice: totalPrice
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Kunne ikke opprette oppdrag')
      }

      router.push('/orders')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="max-w-4xl">
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
        <h1 className="text-3xl font-bold text-gray-900">Nytt oppdrag</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Venstre kolonne - Hovedinfo */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Grunnleggende info */}
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Oppdragsinformasjon</h2>
              
              {/* Kunde */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Kunde *
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    Du må <Link href="/customers/new" className="text-indigo-600">opprette en kunde</Link> først
                  </p>
                )}
              </div>

              {/* Eiendomsadresse */}
              <div>
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Eiendomsadresse *
                </label>
                <input
                  id="propertyAddress"
                  name="propertyAddress"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Storgata 1, 0123 Oslo"
                />
              </div>

              {/* Boligtype */}
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                  Boligtype
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Dato *
                  </label>
                  <input
                    id="scheduledDate"
                    name="scheduledDate"
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Tidspunkt
                  </label>
                  <input
                    id="scheduledTime"
                    name="scheduledTime"
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Prioritet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritet
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="NORMAL"
                      defaultChecked
                      className="mr-2"
                    />
                    <span>Normal prioritering</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="HIGH"
                      className="mr-2"
                    />
                    <span className="text-orange-600 font-medium">Høy prioritering</span>
                  </label>
                </div>
              </div>

              {/* Notater */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notater
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ekstra informasjon om oppdraget..."
                />
              </div>
            </div>

            {/* Produkter */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Velg produkter *</h2>
              
              {products.length === 0 ? (
                <p className="text-gray-500">
                  Ingen produkter tilgjengelig. <Link href="/products/new" className="text-indigo-600">Opprett produkter</Link> først.
                </p>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProducts.includes(product.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900 ml-4">
                            {formatPrice(product.priceExVat)}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Høyre kolonne - Sammendrag */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sammendrag</h2>
                
                {selectedProducts.length === 0 ? (
                  <p className="text-gray-500 text-sm">Ingen produkter valgt</p>
                ) : (
                  <div className="space-y-3">
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId)
                      if (!product) return null
                      
                      return (
                        <div key={productId} className="flex justify-between text-sm">
                          <span className="text-gray-600">{product.name}</span>
                          <span className="font-medium">{formatPrice(product.priceExVat)}</span>
                        </div>
                      )
                    })}
                    
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sum eks. MVA</span>
                        <span className="font-medium">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>MVA (25%)</span>
                        <span>{formatPrice(totalPrice * 0.25)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>{formatPrice(totalPriceIncVat)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || selectedProducts.length === 0}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Oppretter...' : 'Opprett oppdrag'}
                </button>
                
                <Link
                  href="/orders"
                  className="block w-full px-6 py-3 text-center text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}