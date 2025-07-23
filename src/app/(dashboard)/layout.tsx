'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/orders', label: 'Oppdrag', icon: '📸' },
    { href: '/customers', label: 'Kunder', icon: '👥' },
    { href: '/products', label: 'Produkter', icon: '📦' },
    { href: '/photographers', label: 'Fotografer', icon: '👨‍💼' },
    { href: '/analytics', label: 'Statistikk', icon: '📈' },
    { href: '/settings', label: 'Innstillinger', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 border-b">
          <span className="text-2xl font-bold text-indigo-600">iRiS</span>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors ${
                pathname === item.href ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              A7
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">A7 MEDIA</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}