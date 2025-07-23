'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPhotographerPage() {
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
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      baseAddress: formData.get('baseAddress') as string,
      role: formData.get('role') as string || 'PHOTOGRAPHER',
      isActive: formData.get('isActive') === 'on'
    }

    try {
      const res = await fetch('/api/photographers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Kunne ikke opprette fotograf')
      }

      router.push('/photographers')
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
          href="/photographers"
          className="text-gray-500 hover:text-gray-700 flex items-center mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tilbake til fotografer
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Ny fotograf</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Personlig informasjon */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Personlig informasjon</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Fullt navn *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ola Nordmann"
            />
          </div>

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
              placeholder="fotograf@email.no"
            />
            <p className="text-xs text-gray-500 mt-1">
              Brukes for innlogging og varsler
            </p>
          </div>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Midlertidig passord *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Minst 8 tegn"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fotografen kan endre dette ved første innlogging
            </p>
          </div>
        </div>

        {/* Arbeidsinfo */}
        <div className="space-y-6 pt-6 border-t">
          <h2 className="text-lg font-semibold text-gray-900">Arbeidsinformasjon</h2>
          
          <div>
            <label htmlFor="baseAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Base-adresse
            </label>
            <input
              id="baseAddress"
              name="baseAddress"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Storgata 1, 0123 Oslo"
            />
            <p className="text-xs text-gray-500 mt-1">
              Brukes for ruteplanlegging
            </p>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rolle
            </label>
            <select
              id="role"
              name="role"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PHOTOGRAPHER">Fotograf</option>
              <option value="EDITOR">Redigerer</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Aktiv (kan tildeles oppdrag)</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Link
            href="/photographers"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Oppretter...' : 'Opprett fotograf'}
          </button>
        </div>
      </form>
    </div>
  )
}