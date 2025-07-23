'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')

  useEffect(() => {
    loadPhotographers()
  }, [])

  async function loadPhotographers() {
    try {
      const res = await fetch('/api/photographers')
      if (res.ok) {
        const data = await res.json()
        setPhotographers(data)
      }
    } catch (error) {
      console.error('Error loading photographers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrer fotografer
  const filteredPhotographers = photographers.filter((photographer: any) => {
    const matchesSearch = photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (photographer.phone && photographer.phone.includes(searchTerm))
    
    const matchesRole = roleFilter === 'all' || photographer.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && photographer.isActive) ||
                         (statusFilter === 'inactive' && !photographer.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Beregn statistikk
  const stats = {
    total: photographers.length,
    active: photographers.filter((p: any) => p.isActive).length,
    photographers: photographers.filter((p: any) => p.role === 'PHOTOGRAPHER').length,
    editors: photographers.filter((p: any) => p.role === 'EDITOR').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Laster fotografer...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Fotografer</h1>
          <p className="text-gray-400 mt-1">Administrer fotografer og redigerere</p>
        </div>
        <Link href="/photographers/new" className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ny fotograf
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Totalt</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-dark-800 rounded-lg">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Aktive</p>
              <p className="text-2xl font-bold text-nordvik-400 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 bg-nordvik-900/20 rounded-lg">
              <svg className="w-6 h-6 text-nordvik-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fotografer</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.photographers}</p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Redigerere</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.editors}</p>
            </div>
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Søk */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Søk etter navn, e-post, telefon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Rolle filter */}
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Alle roller</option>
            <option value="PHOTOGRAPHER">Fotografer</option>
            <option value="EDITOR">Redigerere</option>
            <option value="ADMIN">Administratorer</option>
          </select>

          {/* Status filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="active">Aktive</option>
            <option value="inactive">Inaktive</option>
            <option value="all">Alle</option>
          </select>
        </div>
      </div>

      {/* Photographers Grid */}
      {filteredPhotographers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Ingen fotografer funnet</h3>
          <p className="text-gray-500 mb-6">Prøv å justere søket eller filteret</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotographers.map((photographer: any) => (
            <div key={photographer.id} className="card card-hover overflow-hidden">
              {/* Header med bilde/initial */}
              <div className="h-32 bg-gradient-to-br from-nordvik-800 to-nordvik-900 relative">
                <div className="absolute inset-0 bg-dark-900/20"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-16 h-16 bg-dark-900 rounded-full flex items-center justify-center text-2xl font-bold text-nordvik-400 border-4 border-dark-900">
                    {photographer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                </div>
                {photographer.isActive && (
                  <div className="absolute top-4 right-4">
                    <span className="status-badge bg-green-900/20 text-green-400 border border-green-800 text-xs">
                      Aktiv
                    </span>
                  </div>
                )}
              </div>

              {/* Innhold */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-200 text-lg mb-1">{photographer.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {photographer.role === 'PHOTOGRAPHER' ? '📷 Fotograf' : 
                   photographer.role === 'EDITOR' ? '✏️ Redigerer' : 
                   photographer.role === 'ADMIN' ? '👤 Administrator' : photographer.role}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{photographer.email}</span>
                  </div>
                  {photographer.phone && (
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {photographer.phone}
                    </div>
                  )}
                  {photographer.baseAddress && (
                    <div className="flex items-center text-gray-400">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{photographer.baseAddress}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-800">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-100">{photographer.totalOrders || 0}</p>
                    <p className="text-xs text-gray-500">Oppdrag totalt</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-nordvik-400">{photographer.completedOrders || 0}</p>
                    <p className="text-xs text-gray-500">Fullførte</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-800 flex justify-between items-center">
                  <Link
                    href={`/photographers/${photographer.id}`}
                    className="text-sm text-nordvik-400 hover:text-nordvik-300 font-medium flex items-center gap-1"
                  >
                    <span>Se profil</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button className="text-gray-400 hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}