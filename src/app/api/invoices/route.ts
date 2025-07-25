import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError } from '@/lib/errors'

// GET /api/invoices - List invoices
export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const customerId = searchParams.get('customerId')
  
  const skip = (page - 1) * limit

  const where: any = { 
    order: { companyId: session.user.companyId }
  }
  
  if (status) where.status = status
  if (customerId) where.customerId = customerId

  const [invoices, total] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: true,
        order: {
          include: {
            orderProducts: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoice.count({ where })
  ])
  
  return NextResponse.json({
    invoices,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// POST /api/invoices - Create invoice from order
export const POST = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan opprette fakturaer')
  }
  
  const body = await request.json()
  const { orderId } = body
  
  if (!orderId) {
    throw new ValidationError('Ordre ID er påkrevd')
  }
  
  // Hent ordre med all nødvendig info
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      companyId: session.user.companyId
    },
    include: {
      customer: true,
      orderProducts: {
        include: {
          product: true
        }
      },
      invoice: true // Sjekk om faktura allerede eksisterer
    }
  })
  
  if (!order) {
    throw new ValidationError('Ordre ikke funnet')
  }
  
  if (order.invoice) {
    throw new ValidationError('Faktura eksisterer allerede for denne ordren')
  }
  
  if (!order.orderProducts || order.orderProducts.length === 0) {
    throw new ValidationError('Kan ikke lage faktura for ordre uten produkter')
  }
  
  // Beregn fakturabeløp
  const subtotal = Number(order.totalAmount || 0)
  const vatAmount = Number(order.vatAmount || 0)
  const total = subtotal + vatAmount
  
  // Sett forfallsdato basert på kundens betalingsbetingelser
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + (order.customer.paymentTerms || 14))
  
  // Opprett faktura med fakturalinjer
  const invoice = await prisma.invoice.create({
    data: {
      orderId: order.id,
      customerId: order.customerId,
      status: 'DRAFT',
      subtotal,
      vatAmount,
      total,
      dueDate,
      lines: {
        create: order.orderProducts.map(op => ({
          description: op.product.name,
          quantity: op.quantity,
          unitPrice: op.unitPrice,
          totalPrice: op.totalPrice,
          vatRate: op.product.vatRate
        }))
      }
    },
    include: {
      customer: true,
      order: true,
      lines: true
    }
  })
  
  return NextResponse.json(invoice, { status: 201 })
})

export const dynamic = 'force-dynamic'