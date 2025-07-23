'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { showToast } from '../ui/Toast'

interface ImageUploaderProps {
  orderId: string
  onUploadComplete: (images: any[]) => void
}

export function ImageUploader({ orderId, onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadQueue, setUploadQueue] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadQueue(prev => [...prev, ...acceptedFiles])
    uploadFiles(acceptedFiles)
  }, [orderId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic', '.heif']
    },
    multiple: true
  })

  async function uploadFiles(files: File[]) {
    setUploading(true)
    const uploadedImages = []

    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('orderId', orderId)

        // Upload med progress tracking
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: percentComplete
            }))
          }
        })

        const uploadPromise = new Promise((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } else {
              reject(new Error('Upload failed'))
            }
          })
          
          xhr.addEventListener('error', () => reject(new Error('Upload error')))
          
          xhr.open('POST', '/api/images/upload')
          xhr.send(formData)
        })

        const result = await uploadPromise
        uploadedImages.push(result)

        // Fjern fra køen
        setUploadQueue(prev => prev.filter(f => f !== file))
        
      } catch (error) {
        console.error('Error uploading file:', error)
        showToast({
          type: 'error',
          title: 'Opplasting feilet',
          message: `Kunne ikke laste opp ${file.name}`
        })
      }
    }

    setUploading(false)
    setUploadProgress({})
    
    if (uploadedImages.length > 0) {
      onUploadComplete(uploadedImages)
      showToast({
        type: 'success',
        title: 'Bilder lastet opp',
        message: `${uploadedImages.length} bilder ble lastet opp`
      })
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
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-nordvik-400 bg-nordvik-900/10' 
            : 'border-dark-700 hover:border-dark-600 bg-dark-800/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          {isDragActive ? (
            <p className="text-nordvik-400 font-medium">Slipp bildene her...</p>
          ) : (
            <>
              <p className="text-gray-300 font-medium mb-2">
                Dra og slipp bilder her, eller klikk for å velge
              </p>
              <p className="text-sm text-gray-500">
                Støtter JPG, PNG, WebP og HEIC/HEIF
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload queue */}
      {uploadQueue.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Laster opp ({uploadQueue.length} bilder)
          </h3>
          {uploadQueue.map((file, index) => (
            <div key={index} className="bg-dark-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div 
                  className="bg-nordvik-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress[file.name] || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}