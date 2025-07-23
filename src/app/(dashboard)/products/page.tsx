'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer produkter
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Grupper produkter etter kategori
  const productsByCategory = filteredProducts.reduce((acc: any, product: any) => {
    const category = product.category || 'Ukategorisert'
    if (!acc[category]) acc[category] = []
    acc[category].push(product)
    return acc
  }, {})

  // Format pris
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Laster produkter...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Produkter</h1>
          <p className="text-gray-400 mt-1">Administrer tjenester og priser</p>
        </div>
        <Link href="/products/new" className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nytt produkt
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totalt produkter</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{products.length}</p>
            </div>
            <div className="p-3 bg-dark-800 rounded-lg">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fotopakker</p>
              <p className="text-2xl font-bold text-nordvik-400 mt-1">
                {products.filter((p: any) => p.category === 'PHOTOGRAPHY').length}
              </p>
            </div>
            <div className="p-3 bg-nordvik-900/20 rounded-lg">
              <svg className="w-6 h-6 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tilleggstjenester</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {products.filter((p: any) => p.category === 'ADDON').length}
              </p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Gjennomsnittspris</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatPrice(products.reduce((sum: number, p: any) => sum + p.price, 0) / products.length || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Søk */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Søk etter produktnavn eller beskrivelse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Kategori filter */}
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Alle kategorier</option>
            <option value="PHOTOGRAPHY">Fotopakker</option>
            <option value="ADDON">Tilleggstjenester</option>
            <option value="FLOORPLAN">Plantegninger</option>
            <option value="OTHER">Annet</option>
          </select>
        </div>
      </div>

      {/* Products by category */}
      {Object.keys(productsByCategory).length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Ingen produkter funnet</h3>
          <p className="text-gray-500 mb-6">Prøv å justere søket eller filteret</p>
          <Link href="/products/new" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Opprett første produkt
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(productsByCategory).map(([category, categoryProducts]: [string, any]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                {category === 'PHOTOGRAPHY' && <span className="text-nordvik-400">📷</span>}
                {category === 'ADDON' && <span className="text-blue-400">➕</span>}
                {category === 'FLOORPLAN' && <span className="text-purple-400">📐</span>}
                {category === 'OTHER' && <span className="text-gray-400">📦</span>}
                {category === 'PHOTOGRAPHY' ? 'Fotopakker' :
                 category === 'ADDON' ? 'Tilleggstjenester' :
                 category === 'FLOORPLAN' ? 'Plantegninger' :
                 category === 'OTHER' ? 'Annet' : category}
                <span className="text-sm text-gray-500">({categoryProducts.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map((product: any) => (
                  <div key={product.id} className="card card-hover p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-200 text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.code ? `Kode: ${product.code}` : 'Ingen kode'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-nordvik-400">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-gray-500">eks. mva</p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {product.estimatedHours && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Estimert tid
                          </span>
                          <span className="font-medium text-gray-300">{product.estimatedHours} timer</span>
                        </div>
                      )}
                      
                      {product.photographerFee && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Fotograf
                          </span>
                          <span className="font-medium text-gray-300">{formatPrice(product.photographerFee)}</span>
                        </div>
                      )}

                      {product.editorFee && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Redigerer
                          </span>
                          <span className="font-medium text-gray-300">{formatPrice(product.editorFee)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between items-center">
                      <span className={`status-badge text-xs ${
                        product.isActive 
                          ? 'bg-green-900/20 text-green-400 border border-green-800' 
                          : 'bg-red-900/20 text-red-400 border border-red-800'
                      }`}>
                        {product.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm text-nordvik-400 hover:text-nordvik-300 font-medium"
                      >
                        Rediger
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}