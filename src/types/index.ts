export interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  priceExVat: number
  vatRate: number
  pke: number
  pki: number
  photographerFee: number
  isActive: boolean
  companyId?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  orgNumber?: string
  email: string
  phone?: string
  invoiceEmail?: string
  companyId?: string
  createdAt: string
}
export interface Order {
  // ... eksisterende felter
  photographer?: {
    id: string
    name: string
    email: string
  }
  photographerId?: string
}
export interface Order {
  // ... eksisterende felter
  products?: string[]
  totalPrice?: number
}
export interface Order {
  id: string
  orderNumber: number
  customerId: string
  propertyAddress: string
  propertyType?: string
  scheduledDate: string
  priority: 'NORMAL' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  companyId?: string
  createdById?: string
  photographerId?: string
  customer?: Customer
  createdAt: string

  
}