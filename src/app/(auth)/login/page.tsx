'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      showToast({
        type: 'success',
        title: 'Innlogget!',
        message: `Velkommen tilbake, ${data.user.name}`
      })

      router.push(callbackUrl)
      router.refresh()
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Innlogging feilet',
        message: error.message || 'Ugyldig e-post eller passord'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="w-full max-w-md">
        <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-nordvik-400 mb-2">IRiS</h1>
            <p className="text-gray-400">Logg inn for å fortsette</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                E-post
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field w-full"
                placeholder="din@epost.no"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Passord
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logger inn...
                </>
              ) : (
                'Logg inn'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-800">
            <p className="text-center text-sm text-gray-500">
              Test brukere:<br/>
              admin@a7media.no / demo123<br/>
              fotograf@a7media.no / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}