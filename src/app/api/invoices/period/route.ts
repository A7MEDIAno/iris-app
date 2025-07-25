import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError } from '@/lib/errors'

// POST /api/invoices/period - Create period invoice
export const POST = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan opprette fakturaer')
  }
  
  const body = await request.json()
  const { customerId, year, month } = body
  
  if (!customerId || !year || !month) {
    throw new ValidationError('Kunde, år og måned er påkrevd')
  }
  
  // Beregn periode
  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0, 23, 59, 59)
  
  // Hent alle fullførte ordre for kunden i perioden
  const orders = await prisma.order.findMany({
    where: {
      customerId,
      companyId: session.user.companyId,
      scheduledDate: {
        gte: periodStart,
        lte: periodEnd
      },
      status: {
        in: ['COMPLETED', 'DELIVERED', 'READY_FOR_DELIVERY']
      },
      invoice: null // Ikke allerede fakturert
    },
    include: {
      customer: true,
      orderProducts: {
        include: {
          product: true
        }
      }
    }
  })
  
  if (orders.length === 0) {
    throw new ValidationError('Ingen ordre å fakturere for denne perioden')
  }
  
  // Beregn totaler
  let subtotal = 0
  let vatAmount = 0
  const invoiceLines: any[] = []
  
  orders.forEach(order => {
    const orderSubtotal = Number(order.totalAmount || 0)
    const orderVat = Number(order.vatAmount || 0)
    
    subtotal += orderSubtotal
    vatAmount += orderVat
    
    // Grupper produkter
    order.orderProducts.forEach(op => {
      const existingLine = invoiceLines.find(
        line => line.productId === op.productId
      )
      
      if (existingLine) {
        existingLine.quantity += op.quantity
        existingLine.totalPrice = Number(existingLine.totalPrice) + Number(op.totalPrice)
      } else {
        invoiceLines.push({
          productId: op.productId,
          description: `${op.product.name} - ${order.propertyAddress}`,
          quantity: op.quantity,
          unitPrice: op.unitPrice,
          totalPrice: op.totalPrice,
          vatRate: op.product.vatRate
        })
      }
    })
  })
  
  const total = subtotal + vatAmount
  
  // Sett forfallsdato basert på kundens betalingsbetingelser
  const customer = orders[0].customer
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + (customer.paymentTerms || 14))
  
  // Opprett samle-faktura
  const invoice = await prisma.$transaction(async (tx) => {
    // Opprett faktura
    const newInvoice = await tx.invoice.create({
      data: {
        customerId,
        status: 'DRAFT',
        subtotal,
        vatAmount,
        total,
        dueDate,
        periodStart,
        periodEnd,
        orderCount: orders.length,
        lines: {
          create: invoiceLines.map(line => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            totalPrice: line.totalPrice,
            vatRate: line.vatRate
          }))
        }
      }
    })
    
    // Koble ordre til fakturaen
    await tx.order.updateMany({
      where: {
        id: { in: orders.map(o => o.id) }
      },
      data: {
        invoiceId: newInvoice.id
      }
    })
    
    return newInvoice
  })
  
  // Hent full faktura med relasjoner
  const fullInvoice = await prisma.invoice.findUnique({
    where: { id: invoice.id },
    include: {
      customer: true,
      lines: true
    }
  })
  
  return NextResponse.json(fullInvoice, { status: 201 })
})