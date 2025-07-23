'use client'

import { useEffect } from 'react'
import Image from 'next/image'

interface ImageLightboxProps {
  images: Array<{
    id: string
    url: string
    originalName: string
  }>
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious
}: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrevious()
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, onClose, onNext, onPrevious])

  if (!isOpen || !images[currentIndex]) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <Image
          src={currentImage.url}
          alt={currentImage.originalName}
          width={1920}
          height={1080}
          className="object-contain"
          priority
        />
      </div>

      {/* Image info */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <p className="text-white/70 text-sm">
          {currentIndex + 1} / {images.length} - {currentImage.originalName}
        </p>
      </div>
    </div>
  )
}