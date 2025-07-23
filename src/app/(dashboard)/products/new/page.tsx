'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // For live-beregninger
  const [priceExVat, setPriceExVat] = useState<number>(0)
  const [pke, setPke] = useState<number>(0)
  const [pki, setPki] = useState<number>(0)
  const [photographerFee, setPhotographerFee] = useState<number>(0)

  const vatAmount = priceExVat * 0.25
  const priceIncVat = priceExVat + vatAmount
  const totalCost = pke + pki + photographerFee
  const profit = priceExVat - totalCost
  const profitMargin = priceExVat > 0 ? (profit / priceExVat) * 100 : 0

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      sku: formData.get('sku') as string,
      priceExVat: Number(formData.get('priceExVat')),
      vatRate: 25,
      pke: Number(formData.get('pke')) || 0,
      pki: Number(formData.get('pki')) || 0,
      photographerFee: Number(formData.get('photographerFee')) || 0,
      isActive: formData.get('isActive') === 'on'
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Kunne ikke opprette produkt')
      }

      router.push('/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/products"
          className="text-gray-500 hover:text-gray-700 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tilbake til produkter
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nytt produkt</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Venstre kolonne - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Produktinformasjon</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Produktnavn *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Standard boligfoto"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivelse
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="15-25 profesjonelle bilder av boligen"
                />
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                  Produktkode (SKU)
                </label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="FOTO-STD-001"
                />
              </div>

              <div>
                <label htmlFor="priceExVat" className="block text-sm font-medium text-gray-700 mb-2">
                  Pris eks. MVA *
                </label>
                <input
                  id="priceExVat"
                  name="priceExVat"
                  type="number"
                  required
                  value={priceExVat}
                  onChange={(e) => setPriceExVat(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="3500"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Kostnader</h2>
              
              <div>
                <label htmlFor="pke" className="block text-sm font-medium text-gray-700 mb-2">
                  PKE (Produksjonskostnad Ekstern)
                </label>
                <input
                  id="pke"
                  name="pke"
                  type="number"
                  value={pke}
                  onChange={(e) => setPke(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kostnad for ekstern redigering, plantegning, etc.
                </p>
              </div>

              <div>
                <label htmlFor="pki" className="block text-sm font-medium text-gray-700 mb-2">
                  PKI (Produksjonskostnad Intern)
                </label>
                <input
                  id="pki"
                  name="pki"
                  type="number"
                  value={pki}
                  onChange={(e) => setPki(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Interne kostnader, transport, utstyr, etc.
                </p>
              </div>

              <div>
                <label htmlFor="photographerFee" className="block text-sm font-medium text-gray-700 mb-2">
                  Fotograf honorar
                </label>
                <input
                  id="photographerFee"
                  name="photographerFee"
                  type="number"
                  value={photographerFee}
                  onChange={(e) => setPhotographerFee(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="1200"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Aktiv</span>
                </label>
              </div>
            </div>
          </div>

          {/* Høyre kolonne - Beregninger */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Beregninger</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pris eks. MVA</span>
                  <span className="font-medium">{priceExVat} kr</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>+ MVA (25%)</span>
                  <span>{vatAmount.toFixed(0)} kr</span>
                </div>
                <div className="flex justify-between font-semibold pt-3 border-t">
                  <span>Pris ink. MVA</span>
                  <span>{priceIncVat.toFixed(0)} kr</span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Inntekt (eks. MVA)</span>
                  <span className="font-medium">{priceExVat} kr</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- PKE</span>
                  <span>-{pke} kr</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- PKI</span>
                  <span>-{pki} kr</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>- Fotograf honorar</span>
                  <span>-{photographerFee} kr</span>
                </div>
                <div className="flex justify-between font-semibold pt-3 border-t">
                  <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    Fortjeneste
                  </span>
                  <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {profit} kr
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fortjenestemargin</span>
                  <span>{profitMargin.toFixed(1)}%</span>
                </div>
              </div>

              {profit < 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    ⚠️ Advarsel: Dette produktet vil gi tap på {Math.abs(profit)} kr per salg
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Link
            href="/products"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Oppretter...' : 'Opprett produkt'}
          </button>
        </div>
      </form>
    </div>
  )
}