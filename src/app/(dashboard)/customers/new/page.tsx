'use client'

import { useRouter } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'
import { showToast } from '@/components/ui/Toast'
import { useState } from 'react'

export default function NewCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Kunne ikke opprette kunde')
      }

      const customer = await res.json()
      
      showToast({
        type: 'success',
        title: 'Kunde opprettet',
        message: `${customer.name} er lagt til i systemet`
      })
      
      router.push(`/customers/${customer.id}`)
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
        <h1 className="text-3xl font-bold text-gray-100">Ny kunde</h1>
        <p className="text-gray-400 mt-1">Registrer ny kunde i systemet</p>
      </div>
      
      <CustomerForm 
        onSubmit={handleSubmit}
        onCancel={() => router.push('/customers')}
        isLoading={isLoading}
      />
    </div>
  )
}