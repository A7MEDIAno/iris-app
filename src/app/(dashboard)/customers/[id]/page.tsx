'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'
import { Building, Mail, Phone, FileText, Package, Calendar, User, Edit, ArrowLeft } from 'lucide-react'

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCustomer()
  }, [params.id])

  async function loadCustomer() {
    try {
      const res = await fetch(`/api/customers/${params.id}`)
      if (!res.ok) throw new Error('Failed to load customer')
      
      const data = await res.json()
      setCustomer(data)
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Kunne ikke laste kunde',
        message: 'Prøv igjen senere'
      })
      router.push('/customers')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-nordvik-500"></div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/customers')}
          className="flex items-center text-gray-400 hover:text-gray-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake til kunder
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">{customer.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-400">
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {customer.phone}
                </span>
              )}
              {customer.orgNumber && (
                <span className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  Org.nr: {customer.orgNumber}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/customers/${params.id}/edit`)}
              className="btn-secondary flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Rediger
            </button>
            <button
              onClick={() => router.push(`/orders/new?customerId=${params.id}`)}
              className="btn-primary"
            >
              Ny ordre
            </button>
          </div>
        </div>
      </div>

      {/* Statistikk */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total omsetning</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                kr {customer.stats?.totalRevenue?.toLocaleString('nb-NO') || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-nordvik-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Utestående</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                kr {customer.stats?.outstandingAmount?.toLocaleString('nb-NO') || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Antall ordre</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {customer.stats?.totalOrders || 0}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Betalingsbetingelser</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {customer.paymentTerms} dager
              </p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kontaktpersoner */}
        <div className="lg:col-span-1">
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-nordvik-400" />
              Kontaktpersoner
            </h2>
            
            {customer.contactPersons && customer.contactPersons.length > 0 ? (
              <div className="space-y-3">
                {customer.contactPersons.map((contact: any) => (
                  <div key={contact.id} className="p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-100">{contact.name}</p>
                        {contact.role && (
                          <p className="text-sm text-gray-400">{contact.role}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-500">{contact.phone}</p>
                        )}
                      </div>
                      {contact.isPrimary && (
                        <span className="px-2 py-1 text-xs bg-nordvik-900/20 text-nordvik-400 rounded">
                          Primær
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Ingen kontaktpersoner registrert</p>
            )}
          </div>

          {/* Fakturainformasjon */}
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-nordvik-400" />
              Fakturainformasjon
            </h2>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Faktura e-post:</span>
                <p className="text-gray-200">{customer.invoiceEmail || customer.email}</p>
              </div>
              
              {customer.invoiceAddress && (
                <div>
                  <span className="text-gray-400">Fakturaadresse:</span>
                  <p className="text-gray-200">{customer.invoiceAddress}</p>
                  <p className="text-gray-200">{customer.invoiceZip} {customer.invoiceCity}</p>
                </div>
              )}
              
              <div>
                <span className="text-gray-400">Kredittgrense:</span>
                <p className="text-gray-200">kr {Number(customer.creditLimit || 0).toLocaleString('nb-NO')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Siste ordre */}
        <div className="lg:col-span-2">
          <div className="bg-dark-900 rounded-lg border border-dark-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100">Siste ordre</h2>
              <button
                onClick={() => router.push(`/orders?customerId=${params.id}`)}
                className="text-sm text-nordvik-400 hover:text-nordvik-300"
              >
                Se alle ordre →
              </button>
            </div>
            
            {customer.orders && customer.orders.length > 0 ? (
              <div className="space-y-3">
                {customer.orders.map((order: any) => (
                  <div 
                    key={order.id}
                    className="p-4 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-100">
                          #{order.orderNumber} - {order.propertyAddress}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(order.scheduledDate).toLocaleDateString('nb-NO')} • 
                          {order.photographer?.name || 'Ikke tildelt'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'COMPLETED' ? 'bg-green-900/20 text-green-400' :
                        order.status === 'PENDING' ? 'bg-yellow-900/20 text-yellow-400' :
                        'bg-blue-900/20 text-blue-400'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Fullført' :
                         order.status === 'PENDING' ? 'Venter' : 'Under arbeid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Ingen ordre ennå</p>
            )}
          </div>
        </div>
      </div>

      {/* Interne notater */}
      {customer.notes && (
        <div className="bg-dark-900 rounded-lg border border-dark-800 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Interne notater</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  )
}