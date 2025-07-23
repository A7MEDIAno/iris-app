'use client'

import { useState, useEffect } from 'react'

interface AssignPhotographerModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  onAssign: (photographerId: string) => void
}

export function AssignPhotographerModal({ isOpen, onClose, order, onAssign }: AssignPhotographerModalProps) {
  const [photographers, setPhotographers] = useState<any[]>([])
  const [selectedPhotographerId, setSelectedPhotographerId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadPhotographers()
    }
  }, [isOpen])

  async function loadPhotographers() {
    try {
      const res = await fetch('/api/photographers')
      const data = await res.json()
      setPhotographers(data.filter((p: any) => p.isActive))
    } catch (error) {
      console.error('Error loading photographers:', error)
    }
  }

  async function handleAssign() {
    if (!selectedPhotographerId) return
    
    setIsLoading(true)
    try {
      await onAssign(selectedPhotographerId)
      onClose()
    } catch (error) {
      console.error('Error assigning photographer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Tildel fotograf</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Oppdrag: <span className="font-medium">#{order?.orderNumber}</span>
          </p>
          <p className="text-sm text-gray-600">
            {order?.propertyAddress}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {photographers.map((photographer) => (
            <label
              key={photographer.id}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedPhotographerId === photographer.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="photographer"
                value={photographer.id}
                checked={selectedPhotographerId === photographer.id}
                onChange={(e) => setSelectedPhotographerId(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <p className="font-medium">{photographer.name}</p>
                <p className="text-sm text-gray-600">{photographer.email}</p>
                {photographer.baseAddress && (
                  <p className="text-xs text-gray-500">Base: {photographer.baseAddress}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Avbryt
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedPhotographerId || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Tildeler...' : 'Tildel'}
          </button>
        </div>
      </div>
    </div>
  )
}