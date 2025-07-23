'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AssignPhotographerModal } from '../../../components/orders/AssignPhotographerModal'

export default function OrdersPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setError(null)
      
      // Hent ordre
      const ordersRes = await fetch('/api/orders')
      if (!ordersRes.ok) {
        throw new Error(`Orders API failed: ${ordersRes.status}`)
      }
      const ordersData = await ordersRes.json()
      setOrders(Array.isArray(ordersData) ? ordersData : [])

      // Hent kunder
      const customersRes = await fetch('/api/customers')
      if (!customersRes.ok) {
        console.warn('Customers API failed:', customersRes.status)
      } else {
        const customersData = await customersRes.json()
        setCustomers(Array.isArray(customersData) ? customersData : [])
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      setError(error.message || 'Kunne ikke laste data')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAssignPhotographer(orderId: string, photographerId: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photographerId })
      })
      
      if (res.ok) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, photographerId, status: 'ASSIGNED' }
              : order
          )
        )
        loadData()
      }
    } catch (error) {
      console.error('Error assigning photographer:', error)
    }
  }

  function openAssignModal(order: any) {
    setSelectedOrder(order)
    setShowAssignModal(true)
  }

  function getCustomerName(customerId: string) {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || 'Ukjent kunde'
  }

  function getStatusColor(status: string) {
    const colors = {
      PENDING: 'yellow',
      ASSIGNED: 'blue',
      IN_PROGRESS: 'purple',
      COMPLETED: 'green',
      CANCELLED: 'red'
    }
    return colors[status] || 'gray'
  }

  function getStatusText(status: string) {
    const texts = {
      PENDING: 'Venter',
      ASSIGNED: 'Tildelt',
      IN_PROGRESS: 'Under arbeid',
      COMPLETED: 'Fullført',
      CANCELLED: 'Kansellert'
    }
    return texts[status] || status
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oppdrag</h1>
        <div style={{ background: '#fee', padding: '1rem', borderRadius: '8px', color: '#c00' }}>
          <p>Feil: {error}</p>
          <button 
            onClick={loadData}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Prøv igjen
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Laster...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Oppdrag</h1>
        <Link
          href="/orders/new"
          style={{ padding: '0.5rem 1rem', background: '#0066cc', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
        >
          + Nytt oppdrag
        </Link>
      </div>

      {orders.length === 0 ? (
        <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p>Ingen oppdrag ennå</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {orders.map((order: any) => (
            <div key={order.id} style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1rem' }}>
              <h3>#{order.orderNumber}</h3>
              <p>{order.propertyAddress}</p>
              <p>{getCustomerName(order.customerId)}</p>
              <p>Status: {getStatusText(order.status)}</p>
              <p>{new Date(order.scheduledDate).toLocaleDateString('nb-NO')}</p>
              
              {order.photographer ? (
                <p>Fotograf: {order.photographer.name}</p>
              ) : (
                <button
                  onClick={() => openAssignModal(order)}
                  style={{ marginTop: '0.5rem', color: '#0066cc', cursor: 'pointer' }}
                >
                  + Tildel fotograf
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AssignPhotographerModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onAssign={(photographerId) => handleAssignPhotographer(selectedOrder.id, photographerId)}
      />
    </div>
  )
}