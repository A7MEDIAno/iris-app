'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      orgNumber: formData.get('orgNumber') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      invoiceEmail: formData.get('invoiceEmail') as string || formData.get('email') as string,
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Kunne ikke opprette kunde')
      }

      router.push('/customers')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/customers"
          className="text-gray-500 hover:text-gray-700 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tilbake til kunder
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Ny kunde</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firmanavn */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Firmanavn *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="DNB Eiendom AS"
            />
          </div>

          {/* Org.nummer */}
          <div>
            <label htmlFor="orgNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Organisasjonsnummer
            </label>
            <input
              id="orgNumber"
              name="orgNumber"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="123 456 789"
            />
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="+47 123 45 678"
            />
          </div>

          {/* E-post */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-post *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="post@dnbeiendom.no"
            />
          </div>

          {/* Faktura e-post */}
          <div>
            <label htmlFor="invoiceEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Faktura e-post
            </label>
            <input
              id="invoiceEmail"
              name="invoiceEmail"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="faktura@dnbeiendom.no"
            />
            <p className="text-xs text-gray-500 mt-1">La stå tom for å bruke samme som e-post</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/customers"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Oppretter...' : 'Opprett kunde'}
          </button>
        </div>
      </form>
    </div>
  )
}