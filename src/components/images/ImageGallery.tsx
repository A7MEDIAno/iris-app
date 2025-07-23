'use client'

import { useState } from 'react'
import Image from 'next/image'
import { showToast } from '../ui/Toast'

interface ImageWithTags {
  id: string
  url: string
  thumbnailUrl?: string
  originalName: string
  size: number
  width?: number | null
  height?: number | null
  tags: Array<{
    id: string
    tag: {
      id: string
      name: string
      icon?: string
    }
  }>
  status: string
}

interface ImageGalleryProps {
  images: ImageWithTags[]
  onTagUpdate: (imageId: string, tagIds: string[]) => Promise<void>
  onImageSelect?: (images: ImageWithTags[]) => void
  onImageDelete?: (imageId: string) => Promise<void>
  availableTags: Array<{ id: string; name: string; icon?: string; category?: string }>
}

export function ImageGallery({ 
  images, 
  onTagUpdate, 
  onImageSelect,
  onImageDelete,
  availableTags 
}: ImageGalleryProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [editingTags, setEditingTags] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Grupper tags etter kategori
  const tagsByCategory = availableTags.reduce((acc, tag) => {
    const category = tag.category || 'andre'
    if (!acc[category]) acc[category] = []
    acc[category].push(tag)
    return acc
  }, {} as Record<string, typeof availableTags>)

  // Filtrer bilder basert på valgt tag
  const filteredImages = filterTag
    ? images.filter(img => img.tags.some(t => t.tag.id === filterTag))
    : images

  function toggleImageSelection(imageId: string) {
    const newSelection = new Set(selectedImages)
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId)
    } else {
      newSelection.add(imageId)
    }
    setSelectedImages(newSelection)
    
    if (onImageSelect) {
      const selected = images.filter(img => newSelection.has(img.id))
      onImageSelect(selected)
    }
  }

  async function handleTagToggle(imageId: string, tagId: string) {
    const image = images.find(img => img.id === imageId)
    if (!image) return

    const currentTagIds = image.tags.map(t => t.tag.id)
    const newTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId]

    await onTagUpdate(imageId, newTagIds)
    
    showToast({
      type: 'success',
      title: 'Tags oppdatert',
      message: 'Bildetags ble oppdatert'
    })
  }

  async function handleDeleteImage(imageId: string) {
    if (!onImageDelete || !confirm('Er du sikker på at du vil slette dette bildet?')) {
      return
    }

    setIsDeleting(imageId)
    try {
      await onImageDelete(imageId)
      showToast({
        type: 'success',
        title: 'Bilde slettet',
        message: 'Bildet ble slettet'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke slette bilde',
        message: 'Prøv igjen senere'
      })
    } finally {
      setIsDeleting(null)
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-dark-900 rounded-lg border border-dark-800 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Filter by tag */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter:</span>
            <select
              value={filterTag || ''}
              onChange={(e) => setFilterTag(e.target.value || null)}
              className="input-field text-sm"
            >
              <option value="">Alle bilder ({images.length})</option>
              {Object.entries(tagsByCategory).map(([category, tags]) => (
                <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.icon} {tag.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* View mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-nordvik-900 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-nordvik-900 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Selected count */}
          {selectedImages.size > 0 && (
            <div className="text-sm text-gray-400">
              {selectedImages.size} bilder valgt
            </div>
          )}
        </div>
      </div>

      {/* Image grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="relative group">
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedImages.has(image.id)}
                  onChange={() => toggleImageSelection(image.id)}
                  className="w-5 h-5 rounded bg-dark-800 border-dark-700"
                />
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteImage(image.id)}
                disabled={isDeleting === image.id}
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 p-1.5 rounded"
              >
                {isDeleting === image.id ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>

              {/* Image */}
              <div className="relative aspect-square bg-dark-800 rounded-lg overflow-hidden">
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={image.originalName}
                  fill
                  className="object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(image.url, '_blank')}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                />
              </div>

              {/* Info */}
              <div className="mt-2">
                <p className="text-xs text-gray-400 truncate">{image.originalName}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(image.size)}
                  {image.width && image.height && ` • ${image.width}×${image.height}`}
                </p>
              </div>

              {/* Tags */}
              <div className="mt-2">
                {editingTags === image.id ? (
                  <div className="bg-dark-800 rounded-lg p-2">
                    <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                      {Object.entries(tagsByCategory).map(([category, tags]) => (
                        <div key={category}>
                          <p className="text-xs text-gray-500 mb-1">{category}</p>
                          {tags.map(tag => (
                            <label key={tag.id} className="flex items-center gap-1 text-xs cursor-pointer hover:text-nordvik-400">
                              <input
                                type="checkbox"
                                checked={image.tags.some(t => t.tag.id === tag.id)}
                                onChange={() => handleTagToggle(image.id, tag.id)}
                                className="rounded"
                              />
                              <span>{tag.icon} {tag.name}</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setEditingTags(null)}
                      className="text-xs text-nordvik-400 mt-2"
                    >
                      Ferdig
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {image.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="text-xs bg-dark-800 px-2 py-1 rounded-full"
                        title={tag.name}
                      >
                        {tag.icon}
                      </span>
                    ))}
                    <button
                      onClick={() => setEditingTags(image.id)}
                      className="text-xs text-gray-500 hover:text-nordvik-400"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view
        <div className="space-y-2">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-dark-900 rounded-lg p-4 flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedImages.has(image.id)}
                onChange={() => toggleImageSelection(image.id)}
                className="rounded"
              />
              
              <div className="relative w-16 h-16 bg-dark-800 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={image.originalName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-200">{image.originalName}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(image.size)}</span>
                  {image.width && image.height && <span>{image.width}×{image.height}</span>}
                  <div className="flex gap-2">
                    {image.tags.map(({ tag }) => (
                      <span key={tag.id}>
                        {tag.icon} {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(image.url, '_blank')}
                  className="text-sm text-nordvik-400 hover:text-nordvik-300"
                >
                  Se full størrelse
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  disabled={isDeleting === image.id}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  {isDeleting === image.id ? 'Sletter...' : 'Slett'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}