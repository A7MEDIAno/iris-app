'use client'

import { useRouter } from 'next/navigation'
import ProductForm from '@/components/products/ProductForm'
import { showToast } from '@/components/ui/Toast'
import { useState } from 'react'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Kunne ikke opprette produkt')
      }

      const product = await res.json()
      
      showToast({
        type: 'success',
        title: 'Produkt opprettet',
        message: `${product.name} er lagt til`
      })
      
      router.push('/products')
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Feil ved opprettelse',
        message: error instanceof Error ? error.message : 'Prøv igjen senere'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Nytt produkt</h1>
        <p className="text-gray-400 mt-1">Opprett ny tjeneste eller produkt</p>
      </div>
      
      <ProductForm 
        onSubmit={handleSubmit}
        onCancel={() => router.push('/products')}
        isLoading={isLoading}
      />
    </div>
  )
}