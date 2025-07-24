'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import { Building, Phone, Mail, Package, AlertCircle } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  orgNumber?: string
  orderCount: number
  overdueInvoices: number
  isActive: boolean
  createdAt: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [currentPage, searchTerm, showInactive])

  async function loadCustomers() {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        activeOnly: (!showInactive).toString()
      })

      const res = await fetch(`/api/customers?${params}`)
      if (!res.ok) throw new Error('Failed to load customers')
      
      const data = await res.json()
      setCustomers(data.customers || [])
      
      if (data.pagination) {
        setTotalPages(data.pagination.pages || 1)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke laste kunder',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Kunder</h1>
          <p className="text-gray-400 mt-1">Administrer meglerkontorer og kunder</p>
        </div>
        <button 
          onClick={() => router.push('/customers/new')}
          className="btn-primary"
        >
          Ny kunde
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Søk etter navn, e-post, org.nummer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="input-field w-full"
            />
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked)
                setCurrentPage(1)
              }}
              className="mr-2"
            />
            <span className="text-sm text-gray-300">Vis inaktive</span>
          </label>
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-800 border-b border-dark-700">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kontaktinfo
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Org.nummer
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-200">{customer.name}</div>
                          {customer.overdueInvoices > 0 && (
                            <div className="flex items-center text-xs text-red-400 mt-1">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {customer.overdueInvoices} forfalt{customer.overdueInvoices > 1 ? 'e' : ''} faktura{customer.overdueInvoices > 1 ? 'er' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-500 mr-2" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="w-4 h-4 text-gray-500 mr-2" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {customer.orgNumber || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Package className="w-4 h-4 text-gray-500 mr-2" />
                        {customer.orderCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.isActive 
                          ? 'bg-green-900/20 text-green-400' 
                          : 'bg-gray-900/20 text-gray-400'
                      }`}>
                        {customer.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/customers/${customer.id}`)}
                        className="text-nordvik-400 hover:text-nordvik-300 text-sm font-medium"
                      >
                        Se detaljer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Ingen kunder matcher søket' : 'Ingen kunder ennå'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-dark-800 px-6 py-4 flex items-center justify-between border-t border-dark-700">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Forrige
            </button>
            <span className="text-sm text-gray-400">
              Side {currentPage} av {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Neste
            </button>
          </div>
        )}
      </div>
    </div>
  )
}