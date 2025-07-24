import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, NotFoundError, ValidationError } from '@/lib/errors'
import { emailQueue } from '@/lib/email/queue'

// GET /api/invoices/[id]
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: params.id,
      order: { companyId: session.user.companyId }
    },
    include: {
      customer: true,
      order: {
        include: {
          photographer: true,
          orderProducts: {
            include: {
              product: true
            }
          }
        }
      },
      lines: true
    }
  })
  
  if (!invoice) {
    throw new NotFoundError('Faktura ikke funnet')
  }
  
  return NextResponse.json(invoice)
})

// PATCH /api/invoices/[id] - Update invoice status
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan oppdatere fakturaer')
  }
  
  const body = await request.json()
  const { status, paidDate } = body
  
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: params.id,
      order: { companyId: session.user.companyId }
    },
    include: {
      customer: true,
      order: true
    }
  })
  
  if (!invoice) {
    throw new NotFoundError('Faktura ikke funnet')
  }
  
  const oldStatus = invoice.status
  
  // Oppdater faktura
  const updatedInvoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(paidDate && { paidDate: new Date(paidDate) })
    }
  })
  
  // Send e-post når faktura sendes
  if (status === 'SENT' && oldStatus === 'DRAFT') {
    try {
      await emailQueue.send({
        type: 'invoice-sent',
        to: invoice.customer.email,
        subject: `Faktura #${invoice.invoiceNumber} - ${invoice.order.propertyAddress}`,
        customerName: invoice.customer.name,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.total),
        dueDate: invoice.dueDate,
        orderNumber: invoice.order.orderNumber
      })
    } catch (error) {
      console.error('Failed to send invoice email:', error)
    }
  }
  
  return NextResponse.json(updatedInvoice)
})

// POST /api/invoices/[id]/send - Send invoice
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan sende fakturaer')
  }
  
  // Marker som sendt
  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: { 
      status: 'SENT',
      sentAt: new Date()
    },
    include: {
      customer: true,
      order: true
    }
  })
  
  // Send e-post
  try {
    await emailQueue.send({
      type: 'invoice-sent',
      to: invoice.customer.email,
      subject: `Faktura #${invoice.invoiceNumber} - ${invoice.order.propertyAddress}`,
      customerName: invoice.customer.name,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: Number(invoice.total),
      dueDate: invoice.dueDate,
      orderNumber: invoice.order.orderNumber
    })
  } catch (error) {
    console.error('Failed to send invoice email:', error)
    throw new Error('Kunne ikke sende faktura på e-post')
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Faktura sendt',
    invoice 
  })
})