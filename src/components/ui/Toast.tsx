'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

const icons = {
  success: (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id)
      }, toast.duration || 5000)
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        bg-dark-900 border border-dark-800 rounded-lg shadow-xl
        p-4 min-w-[320px] max-w-md
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[toast.type]}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-100">{toast.title}</h3>
          {toast.message && (
            <p className="text-sm text-gray-400 mt-1">{toast.message}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-sm text-nordvik-400 hover:text-nordvik-300 font-medium mt-2"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-gray-500 hover:text-gray-400"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

let toastContainer: HTMLDivElement | null = null

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      toastContainer = document.createElement('div')
      toastContainer.className = 'fixed top-4 right-4 z-50 space-y-4'
      document.body.appendChild(toastContainer)

      // Listen for custom toast events
      const handleToast = (e: CustomEvent<Toast>) => {
        setToasts(prev => [...prev, { ...e.detail, id: Date.now().toString() }])
      }

      window.addEventListener('show-toast' as any, handleToast)

      return () => {
        window.removeEventListener('show-toast' as any, handleToast)
        if (toastContainer) {
          document.body.removeChild(toastContainer)
        }
      }
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (!toastContainer || toasts.length === 0) return null

  return createPortal(
    <>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </>,
    toastContainer
  )
}

// Helper function to show toast
export function showToast(toast: Omit<Toast, 'id'>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: toast }))
  }
}