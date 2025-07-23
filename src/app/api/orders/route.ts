import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError } from '@/lib/errors'
import { emailQueue } from '@/lib/email/queue'

export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { companyId: session.user.companyId },
      skip,
      take: limit,
      include: {
        customer: true,
        photographer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count({
      where: { companyId: session.user.companyId }
    })
  ])
  
  // Transform til frontend format
  const transformedOrders = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber.toString(),
    customerName: order.customer.name,
    photographerName: order.photographer?.name,
    propertyAddress: order.propertyAddress,
    shootDate: order.scheduledDate,
    status: order.status,
    totalAmount: 0
  }))
  
  return NextResponse.json({
    orders: transformedOrders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

export const POST = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  const body = await request.json()
  
  // Valider input
  if (!body.customerId || !body.propertyAddress) {
    throw new ValidationError('Missing required fields')
  }
  
  const scheduledDate = new Date(`${body.scheduledDate}T${body.scheduledTime || '12:00'}`)
  
  // Opprett ordre med customer info
  const order = await prisma.order.create({
    data: {
      customerId: body.customerId,
      propertyAddress: body.propertyAddress,
      propertyType: body.propertyType || null,
      scheduledDate,
      priority: body.priority || 'NORMAL',
      status: 'PENDING',
      companyId: session.user.companyId,
      createdById: session.user.id,
      photographerId: body.photographerId
    },
    include: {
      customer: true,
      photographer: true
    }
  })
  
  // Send ordrebekreftelse email
  try {
    await emailQueue.send({
      type: 'order-confirmation',
      to: order.customer.email,
      subject: `Ordrebekreftelse #${order.orderNumber}`,
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      propertyAddress: order.propertyAddress,
      scheduledDate: order.scheduledDate,
      photographerName: order.photographer?.name
    })
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
    // Ikke la email-feil stoppe ordre-opprettelsen
  }
  
  // Send varsel til fotograf hvis tildelt
  if (order.photographer) {
    try {
      await emailQueue.send({
        type: 'photographer-assigned',
        to: order.photographer.email,
        subject: `Nytt oppdrag: ${order.propertyAddress}`,
        photographerName: order.photographer.name,
        orderNumber: order.orderNumber,
        propertyAddress: order.propertyAddress,
        scheduledDate: order.scheduledDate,
        customerName: order.customer.name,
        customerPhone: order.customer.phone || undefined
      })
    } catch (error) {
      console.error('Failed to send photographer notification:', error)
    }
  }
  
  return NextResponse.json(order)
})