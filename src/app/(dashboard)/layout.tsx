'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ToastContainer } from '@/components/ui/Toast'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Ordre', href: '/orders', icon: '📷' },
    { name: 'Kunder', href: '/customers', icon: '🏢' },
    { name: 'Fotografer', href: '/photographers', icon: '👥' },
    { name: 'Produkter', href: '/products', icon: '📦' },
    { name: 'Fakturaer', href: '/invoices', icon: '💰' },
    // Kommenter ut disse til de er implementert:
    // { name: 'Statistikk', href: '/analytics', icon: '📈' },
    // { name: 'Innstillinger', href: '/settings', icon: '⚙️' },
  ]

  return (
    <div className="flex h-screen bg-dark-950">
      {/* Sidebar */}
      <div className="w-64 sidebar">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-nordvik-400">IRiS</h1>
          <p className="text-sm text-gray-500 mt-1">A7 MEDIA</p>
        </div>
        
        <nav className="px-4 pb-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-nordvik-800 rounded-full flex items-center justify-center text-white font-semibold">
              ML
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Mats Lønne</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hovedinnhold */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  )
}