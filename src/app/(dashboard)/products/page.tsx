'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import { Package, DollarSign, BarChart3, Tag, Edit, Trash2, Plus } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  category?: string
  sku?: string
  priceExVat: number
  vatRate: number
  pke: number
  pki: number
  photographerFee: number
  isActive: boolean
  createdAt: string
}

interface GroupedProducts {
  [category: string]: Product[]
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [showInactive])

  async function loadProducts() {
    try {
      const params = new URLSearchParams({
        activeOnly: (!showInactive).toString()
      })

      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Failed to load products')
      
      const data = await res.json()
      setProducts(data.products || [])
      setGroupedProducts(data.groupedProducts || {})
    } catch (error) {
      console.error('Error loading products:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste produkter',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProfit = (product: Product) => {
    const totalCost = Number(product.pke) + Number(product.pki) + Number(product.photographerFee)
    const profit = Number(product.priceExVat) - totalCost
    const margin = Number(product.priceExVat) > 0 ? (profit / Number(product.priceExVat)) * 100 : 0
    return { profit, margin }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getMarginColor = (margin: number) => {
    if (margin < 0) return 'text-red-500'
    if (margin < 20) return 'text-yellow-500'
    if (margin < 40) return 'text-blue-500'
    return 'text-green-500'
  }

  const getCategoryLabel = (category: string | null) => {
    const labels: Record<string, string> = {
      'foto': 'Fotografi',
      'video': 'Video',
      'drone': 'Drone',
      'plantegning': 'Plantegning',
      'styling': 'Styling',
      'tillegg': 'Tilleggstjenester',
      'Ukategorisert': 'Ukategorisert'
    }
    return labels[category || 'Ukategorisert'] || category || 'Ukategorisert'
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => (p.category || 'Ukategorisert') === selectedCategory)

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
          <h1 className="text-3xl font-bold text-gray-100">Produkter</h1>
          <p className="text-gray-400 mt-1">Administrer tjenester og priser</p>
        </div>
        <button 
          onClick={() => router.push('/products/new')}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nytt produkt
        </button>
      </div>

      {/* Statistikk */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Totalt produkter</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {products.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-nordvik-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Aktive produkter</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Snitt pris</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {formatCurrency(
                  products.reduce((sum, p) => sum + Number(p.priceExVat), 0) / products.length || 0
                )}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Snitt margin</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {products.length > 0 
                  ? (products.reduce((sum, p) => sum + calculateProfit(p).margin, 0) / products.length).toFixed(1)
                  : 0
                }%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-nordvik-500 text-white' 
                  : 'bg-dark-800 text-gray-400 hover:text-gray-300'
              }`}
            >
              Alle kategorier
            </button>
            {Object.keys(groupedProducts).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? 'bg-nordvik-500 text-white' 
                    : 'bg-dark-800 text-gray-400 hover:text-gray-300'
                }`}
              >
                {getCategoryLabel(category)} ({groupedProducts[category].length})
              </button>
            ))}
          </div>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-300">Vis inaktive</span>
          </label>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const { profit, margin } = calculateProfit(product)
          const priceIncVat = Number(product.priceExVat) * (1 + Number(product.vatRate) / 100)
          
          return (
            <div 
              key={product.id} 
              className={`bg-dark-900 rounded-lg border ${
                product.isActive ? 'border-dark-800' : 'border-dark-700 opacity-60'
              } p-6 hover:border-nordvik-500 transition-colors`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{product.name}</h3>
                  {product.sku && (
                    <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => router.push(`/products/${product.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-nordvik-400 hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {product.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Pris eks. MVA</span>
                  <span className="font-medium text-gray-200">{formatCurrency(Number(product.priceExVat))}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Pris inkl. MVA</span>
                  <span className="font-medium text-gray-200">{formatCurrency(priceIncVat)}</span>
                </div>

                <div className="border-t border-dark-800 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Kostnader</span>
                    <span className="text-sm text-gray-400">
                      {formatCurrency(Number(product.pke) + Number(product.pki) + Number(product.photographerFee))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Fortjeneste</span>
                    <div className="text-right">
                      <p className={`font-medium ${getMarginColor(margin)}`}>
                        {formatCurrency(profit)}
                      </p>
                      <p className={`text-xs ${getMarginColor(margin)}`}>
                        {margin.toFixed(1)}% margin
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {!product.isActive && (
                <div className="mt-4 px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 text-center">
                  Inaktiv
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'Ingen produkter opprettet ennå'
              : `Ingen produkter i kategorien ${getCategoryLabel(selectedCategory)}`
            }
          </p>
        </div>
      )}
    </div>
  )
}