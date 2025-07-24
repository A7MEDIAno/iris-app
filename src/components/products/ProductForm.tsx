'use client'

import { useState, useEffect } from 'react'
import { Package, DollarSign, Calculator, Tag, BarChart3, AlertCircle } from 'lucide-react'

interface ProductFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const PRODUCT_CATEGORIES = [
  { value: 'foto', label: 'Fotografi' },
  { value: 'video', label: 'Video' },
  { value: 'drone', label: 'Drone' },
  { value: 'plantegning', label: 'Plantegning' },
  { value: 'styling', label: 'Styling' },
  { value: 'tillegg', label: 'Tilleggstjenester' }
]

export default function ProductForm({ initialData, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    priceExVat: 0,
    vatRate: 25,
    pke: 0,
    pki: 0,
    photographerFee: 0,
    isActive: true,
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [profitAnalysis, setProfitAnalysis] = useState({
    totalCost: 0,
    profit: 0,
    profitMargin: 0,
    priceIncVat: 0
  })

  // Beregn fortjeneste når priser endres
  useEffect(() => {
    const price = Number(formData.priceExVat) || 0
    const pke = Number(formData.pke) || 0
    const pki = Number(formData.pki) || 0
    const photographerFee = Number(formData.photographerFee) || 0
    const vatRate = Number(formData.vatRate) || 0

    const totalCost = pke + pki + photographerFee
    const profit = price - totalCost
    const profitMargin = price > 0 ? (profit / price) * 100 : 0
    const priceIncVat = price * (1 + vatRate / 100)

    setProfitAnalysis({
      totalCost,
      profit,
      profitMargin,
      priceIncVat
    })
  }, [formData.priceExVat, formData.pke, formData.pki, formData.photographerFee, formData.vatRate])

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}

    // Validering
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Produktnavn må være minst 2 tegn'
    }

    if (!formData.priceExVat || formData.priceExVat <= 0) {
      newErrors.priceExVat = 'Pris må være større enn 0'
    }

    if (formData.vatRate < 0 || formData.vatRate > 100) {
      newErrors.vatRate = 'MVA-sats må være mellom 0 og 100'
    }

    // Advarsel hvis negative marginer
    if (profitAnalysis.profit < 0) {
      newErrors.profit = 'Advarsel: Produktet går med tap!'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSubmit(formData)
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

  return (
    <div className="space-y-6">
      {/* Grunnleggende informasjon */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center mb-4">
          <Package className="w-5 h-5 text-nordvik-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-100">Produktinformasjon</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Produktnavn *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="F.eks. Standard fotopakke"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field w-full"
            >
              <option value="">Velg kategori</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              SKU/Produktkode
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="input-field w-full"
              placeholder="FOTO-STD-001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Beskrivelse
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-field w-full"
              placeholder="Beskriv hva produktet inkluderer..."
            />
          </div>
        </div>
      </div>

      {/* Prising */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="w-5 h-5 text-nordvik-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-100">Prising</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pris eks. MVA *
            </label>
            <input
              type="number"
              value={formData.priceExVat}
              onChange={(e) => setFormData({ ...formData, priceExVat: parseFloat(e.target.value) || 0 })}
              className={`input-field w-full ${errors.priceExVat ? 'border-red-500' : ''}`}
              placeholder="1500"
              min="0"
              step="100"
            />
            {errors.priceExVat && (
              <p className="mt-1 text-sm text-red-500">{errors.priceExVat}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              MVA-sats (%)
            </label>
            <input
              type="number"
              value={formData.vatRate}
              onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
              className={`input-field w-full ${errors.vatRate ? 'border-red-500' : ''}`}
              min="0"
              max="100"
              step="1"
            />
            {errors.vatRate && (
              <p className="mt-1 text-sm text-red-500">{errors.vatRate}</p>
            )}
          </div>

          <div className="md:col-span-2 p-4 bg-dark-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Pris inkl. MVA:</span>
              <span className="text-lg font-semibold text-gray-100">
                {formatCurrency(profitAnalysis.priceIncVat)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kostnader */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center mb-4">
          <Calculator className="w-5 h-5 text-nordvik-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-100">Kostnader</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fotografhonorar (PKE)
            </label>
            <input
              type="number"
              value={formData.pke}
              onChange={(e) => setFormData({ ...formData, pke: parseFloat(e.target.value) || 0 })}
              className="input-field w-full"
              placeholder="500"
              min="0"
              step="50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Betales til fotograf
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Intern kostnad (PKI)
            </label>
            <input
              type="number"
              value={formData.pki}
              onChange={(e) => setFormData({ ...formData, pki: parseFloat(e.target.value) || 0 })}
              className="input-field w-full"
              placeholder="200"
              min="0"
              step="50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Interne kostnader
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ekstra honorar
            </label>
            <input
              type="number"
              value={formData.photographerFee}
              onChange={(e) => setFormData({ ...formData, photographerFee: parseFloat(e.target.value) || 0 })}
              className="input-field w-full"
              placeholder="0"
              min="0"
              step="50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Tillegg til fotograf
            </p>
          </div>
        </div>
      </div>

      {/* Fortjeneste-analyse */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-nordvik-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-100">Fortjeneste-analyse</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Total kostnad</p>
            <p className="text-xl font-semibold text-gray-100">
              {formatCurrency(profitAnalysis.totalCost)}
            </p>
          </div>

          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Fortjeneste</p>
            <p className={`text-xl font-semibold ${getProfitColor(profitAnalysis.profitMargin)}`}>
              {formatCurrency(profitAnalysis.profit)}
            </p>
          </div>

          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Margin</p>
            <p className={`text-xl font-semibold ${getProfitColor(profitAnalysis.profitMargin)}`}>
              {profitAnalysis.profitMargin.toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-dark-800 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">ROI</p>
            <p className="text-xl font-semibold text-gray-100">
              {profitAnalysis.totalCost > 0 
                ? ((profitAnalysis.profit / profitAnalysis.totalCost) * 100).toFixed(0)
                : '∞'
              }%
            </p>
          </div>
        </div>

        {errors.profit && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{errors.profit}</p>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
        <div className="flex items-center mb-4">
          <Tag className="w-5 h-5 text-nordvik-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-100">Status</h3>
        </div>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="mr-3 h-4 w-4 text-nordvik-500 focus:ring-nordvik-500 border-gray-600 rounded"
          />
          <span className="text-gray-300">Produktet er aktivt og kan bestilles</span>
        </label>
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-dark-950 py-4 border-t border-dark-800">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Avbryt
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Lagrer...' : (initialData ? 'Oppdater produkt' : 'Opprett produkt')}
        </button>
      </div>
    </div>
  )
}