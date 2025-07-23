'use client'

import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      companyName: formData.get('companyName') as string,
      orgNumber: formData.get('orgNumber') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Noe gikk galt')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Noe gikk galt')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-3xl font-bold">iRiS</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Kom i gang med IRiS</h2>
        <p className="text-gray-600 mt-2">Opprett din konto på under 2 minutter</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Firmainformasjon */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Firmainformasjon</h3>
          
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              Firmanavn
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="A7 MEDIA AS"
            />
          </div>

          <div>
            <label htmlFor="orgNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Organisasjonsnummer
            </label>
            <input
              id="orgNumber"
              name="orgNumber"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="123 456 789"
            />
          </div>
        </div>

        {/* Personlig informasjon */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Din informasjon</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Fullt navn
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
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="din@email.no"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Passord
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
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
        >
          {isLoading ? 'Oppretter konto...' : 'Opprett konto'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Har du allerede konto?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Logg inn
          </Link>
        </p>
      </form>
    </div>
  )
}