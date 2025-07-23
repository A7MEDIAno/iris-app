'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    orders: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    customers: { total: 0, new: 0 },
    photographers: { total: 0, active: 0 },
    revenue: { month: 0, lastMonth: 0 }
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Hent alle data parallelt
      const [ordersRes, customersRes, photographersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/photographers')
      ])

      if (ordersRes.ok) {
        const orders = await ordersRes.json()
        const now = new Date()
        const thisMonth = now.getMonth()
        const thisYear = now.getFullYear()
        
        setStats(prev => ({
          ...prev,
          orders: {
            total: orders.length,
            pending: orders.filter((o: any) => o.status === 'PENDING').length,
            inProgress: orders.filter((o: any) => o.status === 'IN_PROGRESS').length,
            completed: orders.filter((o: any) => o.status === 'COMPLETED').length
          }
        }))
        
        // Sett de 5 siste ordrene
        setRecentOrders(orders.slice(0, 5))
      }

      if (customersRes.ok) {
        const customers = await customersRes.json()
        const newCustomers = customers.filter((c: any) => {
          const date = new Date(c.createdAt)
          const now = new Date()
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }).length

        setStats(prev => ({
          ...prev,
          customers: { total: customers.length, new: newCustomers }
        }))
      }

      if (photographersRes.ok) {
        const photographers = await photographersRes.json()
        setStats(prev => ({
          ...prev,
          photographers: {
            total: photographers.length,
            active: photographers.filter((p: any) => p.isActive).length
          }
        }))
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Beregn prosentvis endring
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Laster dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Oversikt</h1>
        <p className="text-gray-400 mt-1">Velkommen tilbake! Her er dagens status.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Aktive oppdrag */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive oppdrag</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">
                {stats.orders.pending + stats.orders.inProgress}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                <span className="text-yellow-400">{stats.orders.pending}</span> venter, 
                <span className="text-blue-400 ml-1">{stats.orders.inProgress}</span> pågår
              </p>
            </div>
            <div className="p-3 bg-nordvik-900/20 rounded-lg">
              <svg className="w-8 h-8 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Fullførte denne måned */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fullført denne måned</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{stats.orders.completed}</p>
              <p className="text-sm text-gray-400 mt-2 flex items-center">
                <svg className="w-4 h-4 text-green-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                +12% fra forrige måned
              </p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Totalt kunder */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totalt kunder</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{stats.customers.total}</p>
              <p className="text-sm text-gray-400 mt-2">
                <span className="text-nordvik-400">+{stats.customers.new}</span> nye denne måned
              </p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Aktive fotografer */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive fotografer</p>
              <p className="text-3xl font-bold text-gray-100 mt-1">{stats.photographers.active}</p>
              <p className="text-sm text-gray-400 mt-2">
                av {stats.photographers.total} totalt
              </p>
            </div>
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/orders/new" className="card card-hover p-6 flex items-center gap-4 group">
          <div className="p-4 bg-nordvik-900/20 rounded-lg group-hover:bg-nordvik-900/30 transition-colors">
            <svg className="w-8 h-8 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Ny bestilling</h3>
            <p className="text-sm text-gray-400">Opprett nytt foto-oppdrag</p>
          </div>
          <svg className="w-5 h-5 text-gray-500 ml-auto transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link href="/customers/new" className="card card-hover p-6 flex items-center gap-4 group">
          <div className="p-4 bg-blue-900/20 rounded-lg group-hover:bg-blue-900/30 transition-colors">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Ny kunde</h3>
            <p className="text-sm text-gray-400">Registrer nytt meglerkontor</p>
          </div>
          <svg className="w-5 h-5 text-gray-500 ml-auto transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link href="/analytics" className="card card-hover p-6 flex items-center gap-4 group">
          <div className="p-4 bg-purple-900/20 rounded-lg group-hover:bg-purple-900/30 transition-colors">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Se statistikk</h3>
            <p className="text-sm text-gray-400">Analyser ytelse og trender</p>
          </div>
          <svg className="w-5 h-5 text-gray-500 ml-auto transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Recent Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="p-6 border-b border-dark-800">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-200">Siste bestillinger</h2>
              <Link href="/orders" className="text-sm text-nordvik-400 hover:text-nordvik-300">
                Se alle →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-dark-800">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Ingen bestillinger ennå
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="p-4 hover:bg-dark-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-200">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-400">{order.propertyAddress}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`status-badge text-xs ${
                        order.status === 'PENDING' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800' :
                        order.status === 'IN_PROGRESS' ? 'bg-blue-900/20 text-blue-400 border border-blue-800' :
                        order.status === 'COMPLETED' ? 'bg-green-900/20 text-green-400 border border-green-800' :
                        'bg-gray-900/20 text-gray-400 border border-gray-800'
                      }`}>
                        {order.status === 'PENDING' ? 'Venter' :
                         order.status === 'IN_PROGRESS' ? 'Pågår' :
                         order.status === 'COMPLETED' ? 'Fullført' : order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Aktivitet siste 7 dager</h2>
          <div className="h-64 flex items-center justify-center bg-dark-800 rounded-lg">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-gray-500">Aktivitetsgraf kommer snart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}