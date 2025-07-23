import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'

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
  
  const order = await prisma.order.create({
    data: {
      customerId: body.customerId,
      propertyAddress: body.propertyAddress,
      propertyType: body.propertyType || null,
      scheduledDate,
      priority: body.priority || 'NORMAL',
      status: 'PENDING',
      companyId: session.user.companyId,
      createdById: session.user.id
    },
    include: {
      customer: true
    }
  })
  
  return NextResponse.json(order)
})