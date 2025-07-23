'use client'

import { useState } from 'react'
import { showToast } from '../ui/Toast'

export interface FilterConfig {
  search: string
  status?: string[]
  dateRange?: {
    from: Date | null
    to: Date | null
  }
  photographers?: string[]
  customers?: string[]
  priceRange?: {
    min: number | null
    max: number | null
  }
  tags?: string[]
}

interface SavedFilter {
  id: string
  name: string
  config: FilterConfig
  isDefault?: boolean
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterConfig) => void
  availablePhotographers: { id: string; name: string }[]
  availableCustomers: { id: string; name: string }[]
}

export function AdvancedFilters({ 
  onFiltersChange, 
  availablePhotographers, 
  availableCustomers 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterConfig>({
    search: '',
    status: [],
    photographers: [],
    customers: [],
  })
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: 'Mine aktive',
      config: {
        search: '',
        status: ['PENDING', 'IN_PROGRESS'],
        photographers: ['current-user-id']
      }
    },
    {
      id: '2',
      name: 'Forfalt',
      config: {
        search: '',
        status: ['PENDING'],
        dateRange: {
          from: null,
          to: new Date()
        }
      }
    }
  ])

  const updateFilter = (key: keyof FilterConfig, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const saveCurrentFilter = () => {
    const name = prompt('Navn på filter:')
    if (name) {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name,
        config: { ...filters }
      }
      setSavedFilters([...savedFilters, newFilter])
      showToast({
        type: 'success',
        title: 'Filter lagret',
        message: `"${name}" er lagret og kan brukes senere`
      })
    }
  }

  const applySavedFilter = (filter: SavedFilter) => {
    setFilters(filter.config)
    onFiltersChange(filter.config)
    showToast({
      type: 'info',
      title: `Filter "${filter.name}" aktivert`
    })
  }

  const clearFilters = () => {
    const emptyFilters: FilterConfig = {
      search: '',
      status: [],
      photographers: [],
      customers: [],
    }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    showToast({
      type: 'info',
      title: 'Filtre tilbakestilt'
    })
  }

  const activeFilterCount = Object.values(filters).filter(v => 
    v && (Array.isArray(v) ? v.length > 0 : v !== '')
  ).length

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-800 shadow-lg mb-6">
      <div className="p-4">
        {/* Hovedsøk */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Søk etter adresse, ordrenummer, kunde..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`btn-secondary flex items-center gap-2 ${isExpanded ? 'bg-nordvik-900 text-white' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Avanserte filtre
            {activeFilterCount > 0 && (
              <span className="bg-nordvik-700 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Lagrede filtre */}
        {savedFilters.length > 0 && (
          <div className="flex gap-2 mt-4">
            <span className="text-sm text-gray-500">Hurtigfiltre:</span>
            {savedFilters.map(filter => (
              <button
                key={filter.id}
                onClick={() => applySavedFilter(filter)}
                className="text-sm px-3 py-1 bg-dark-800 hover:bg-dark-700 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                {filter.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avanserte filtre */}
      {isExpanded && (
        <div className="border-t border-dark-800 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => {
                        const newStatus = e.target.checked
                          ? [...(filters.status || []), status]
                          : filters.status?.filter(s => s !== status) || []
                        updateFilter('status', newStatus)
                      }}
                      className="mr-2 rounded bg-dark-800 border-dark-700"
                    />
                    <span className="text-sm text-gray-300">
                      {status === 'PENDING' ? 'Venter' :
                       status === 'ASSIGNED' ? 'Tildelt' :
                       status === 'IN_PROGRESS' ? 'Under arbeid' :
                       status === 'COMPLETED' ? 'Fullført' : 'Kansellert'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dato range */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Dato periode
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  className="input-field w-full"
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: e.target.value ? new Date(e.target.value) : null
                  })}
                />
                <input
                  type="date"
                  className="input-field w-full"
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    to: e.target.value ? new Date(e.target.value) : null
                  })}
                />
              </div>
            </div>

            {/* Fotograf */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fotograf
              </label>
              <select
                multiple
                className="input-field w-full h-24"
                value={filters.photographers || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  updateFilter('photographers', selected)
                }}
              >
                {availablePhotographers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Kunde */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Kunde
              </label>
              <select
                multiple
                className="input-field w-full h-24"
                value={filters.customers || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  updateFilter('customers', selected)
                }}
              >
                {availableCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Pris range */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Pris (NOK)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="input-field w-full"
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    min: e.target.value ? Number(e.target.value) : null
                  })}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="input-field w-full"
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    max: e.target.value ? Number(e.target.value) : null
                  })}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-4 pt-4 border-t border-dark-800">
            <div className="flex gap-2">
              <button onClick={saveCurrentFilter} className="btn-secondary text-sm">
                Lagre filter
              </button>
              <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-gray-300">
                Tilbakestill
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {activeFilterCount > 0 && `${activeFilterCount} aktive filtre`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}