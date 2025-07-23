'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error til console i development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center p-8 bg-dark-900 rounded-lg border border-dark-800 max-w-md">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-100 mb-2">
          Noe gikk galt!
        </h2>
        
        <p className="text-gray-400 mb-6">
          {error.message || 'En uventet feil oppstod. Vennligst prøv igjen.'}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-primary"
          >
            Prøv igjen
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="btn-secondary"
          >
            Gå til forsiden
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <p className="text-xs text-gray-600 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}