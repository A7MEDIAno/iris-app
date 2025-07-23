'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  activeOrders: number
  completedThisMonth: number
  monthlyRevenue: number
  totalCustomers: number
  totalPhotographers: number
  ordersByStatus: {
    pending: number
    assigned: number
    inProgress: number
    completed: number
  }
  recentOrders: any[]
  topPhotographers: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeOrders: 0,
    completedThisMonth: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    totalPhotographers: 0,
    ordersByStatus: {
      pending: 0,
      assigned: 0,
      inProgress: 0,
      completed: 0
    },
    recentOrders: [],
    topPhotographers: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Hent all data
      const [ordersRes, customersRes, photographersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/photographers'),
        fetch('/api/products')
      ])

      const orders = await ordersRes.json()
      const customers = await customersRes.json()
      const photographers = await photographersRes.json()
      const products = await productsRes.json()

      // Beregn statistikk
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // Aktive oppdrag (ikke fullført/kansellert)
      const activeOrders = orders.filter((o: any) => 
        !['COMPLETED', 'CANCELLED'].includes(o.status)
      ).length

      // Fullført denne måneden
      const completedThisMonth = orders.filter((o: any) => {
        if (o.status !== 'COMPLETED') return false
        const orderDate = new Date(o.createdAt)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      }).length

      // Månedlig omsetning
      const monthlyRevenue = orders
        .filter((o: any) => {
          const orderDate = new Date(o.createdAt)
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
        })
        .reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0)

      // Ordre etter status
      const ordersByStatus = orders.reduce((acc: any, order: any) => {
        const status = order.status.toLowerCase()
        if (status === 'pending') acc.pending++
        else if (status === 'assigned') acc.assigned++
        else if (status === 'in_progress') acc.inProgress++
        else if (status === 'completed') acc.completed++
        return acc
      }, { pending: 0, assigned: 0, inProgress: 0, completed: 0 })

      // Siste 5 ordre
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      // Top fotografer (mock data for nå)
      const photographerStats = photographers.map((p: any) => {
        const photographerOrders = orders.filter((o: any) => o.photographerId === p.id)
        return {
          ...p,
          orderCount: photographerOrders.length,
          completedCount: photographerOrders.filter((o: any) => o.status === 'COMPLETED').length
        }
      }).sort((a: any, b: any) => b.orderCount - a.orderCount)

      setStats({
        activeOrders,
        completedThisMonth,
        monthlyRevenue,
        totalCustomers: customers.length,
        totalPhotographers: photographers.length,
        ordersByStatus,
        recentOrders,
        topPhotographers: photographerStats.slice(0, 3)
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  function getStatusColor(status: string) {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      ASSIGNED: 'text-blue-600 bg-blue-100',
      IN_PROGRESS: 'text-purple-600 bg-purple-100',
      COMPLETED: 'text-green-600 bg-green-100',
      CANCELLED: 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Laster dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktive oppdrag</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <Link href="/orders" className="text-sm text-indigo-600 hover:text-indigo-700 mt-3 inline-block">
            Se alle oppdrag →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fullført denne måneden</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedThisMonth}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Månedlig omsetning</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link href="/analytics" className="text-sm text-indigo-600 hover:text-indigo-700 mt-3 inline-block">
            Se detaljer →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totalt antall kunder</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <Link href="/customers" className="text-sm text-indigo-600 hover:text-indigo-700 mt-3 inline-block">
            Se alle kunder →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status Overview */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ordrestatus</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Venter</span>
              </div>
              <span className="text-sm font-medium">{stats.ordersByStatus.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Tildelt</span>
              </div>
              <span className="text-sm font-medium">{stats.ordersByStatus.assigned}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Under arbeid</span>
              </div>
              <span className="text-sm font-medium">{stats.ordersByStatus.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Fullført</span>
              </div>
              <span className="text-sm font-medium">{stats.ordersByStatus.completed}</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Siste oppdrag</h2>
            <Link href="/orders" className="text-sm text-indigo-600 hover:text-indigo-700">
              Se alle →
            </Link>
          </div>
          
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Ingen oppdrag ennå</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.propertyAddress}</p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Vis →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Photographers */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top fotografer</h2>
        {stats.topPhotographers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Ingen fotografer ennå</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topPhotographers.map((photographer: any, index: number) => (
              <div key={photographer.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{photographer.name}</p>
                  <p className="text-sm text-gray-600">
                    {photographer.orderCount} oppdrag ({photographer.completedCount} fullført)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Hurtighandlinger</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/orders/new"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm font-medium">Nytt oppdrag</p>
          </Link>
          
          <Link
            href="/customers/new"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <p className="text-sm font-medium">Ny kunde</p>
          </Link>
          
          <Link
            href="/photographers/new"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium">Ny fotograf</p>
          </Link>
          
          <Link
            href="/products/new"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-center transition-colors"
          >
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm font-medium">Nytt produkt</p>
          </Link>
        </div>
      </div>
    </div>
  )
}