'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ToastContainer } from '@/components/ui/Toast'
import { useState, useEffect } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserSession {
  user: {
    id: string
    name: string
    email: string
    role: string
    profileImage?: string
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadSession()
  }, [])

  async function loadSession() {
    try {
      const res = await fetch('/api/auth/session')
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setSession(data)
    } catch (error) {
      console.error('Failed to load session:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Rolle-basert navigasjon
  const navigation = session?.user?.role === 'ADMIN' 
    ? [
        { name: 'Dashboard', href: '/', icon: '📊' },
        { name: 'Ordre', href: '/orders', icon: '📷' },
        { name: 'Kunder', href: '/customers', icon: '🏢' },
        { name: 'Fotografer', href: '/photographers', icon: '👥' },
        { name: 'Produkter', href: '/products', icon: '📦' },
        { name: 'Fakturaer', href: '/invoices', icon: '💰' },
        { name: 'Profil', href: '/profile', icon: '👤' },
      ]
    : [
        { name: 'Mine oppdrag', href: '/my-orders', icon: '📷' },
        { name: 'Min inntekt', href: '/my-income', icon: '💰' },
        { name: 'Min kalender', href: '/my-calendar', icon: '📅' },
        { name: 'Profil', href: '/profile', icon: '👤' },
      ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Få initialer for profilbilde
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen bg-dark-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 sidebar">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-nordvik-400">IRiS</h1>
          <p className="text-sm text-gray-500 mt-1">A7 MEDIA</p>
        </div>
        
        <nav className="flex-1 px-4 pb-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/' && pathname === '/dashboard')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-nordvik-900 text-white' 
                    : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bruker info nederst */}
        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            {session.user.profileImage ? (
              <img
                src={session.user.profileImage}
                alt={session.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-nordvik-800 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(session.user.name)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">{session.user.name}</p>
              <p className="text-xs text-gray-500">
                {session.user.role === 'ADMIN' ? 'Administrator' : 'Fotograf'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logg ut</span>
          </button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-dark-900 border-b border-dark-800 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-nordvik-400">IRiS</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-400 hover:text-gray-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-dark-950 z-40 pt-16">
          <nav className="p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === '/' && pathname === '/dashboard')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-nordvik-900 text-white' 
                      : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile user info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
            <div className="flex items-center gap-3 px-2 mb-3">
              {session.user.profileImage ? (
                <img
                  src={session.user.profileImage}
                  alt={session.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-nordvik-800 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(session.user.name)}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">{session.user.name}</p>
                <p className="text-xs text-gray-500">
                  {session.user.role === 'ADMIN' ? 'Administrator' : 'Fotograf'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logg ut</span>
            </button>
          </div>
        </div>
      )}

      {/* Hovedinnhold */}
      <div className="flex-1 overflow-auto md:pt-0 pt-16">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}