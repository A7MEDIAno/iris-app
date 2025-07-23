import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, NotFoundError } from '@/lib/errors'
import { emailQueue } from '@/lib/email/queue'
import { env } from '@/lib/config/env'

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()

  const order = await prisma.order.findFirst({
    where: { 
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      customer: true,
      photographer: true,
      images: {
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      }
    }
  })

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  return NextResponse.json(order)
})

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  const body = await request.json()
  const { status } = body

  // Finn ordre med all nødvendig info
  const order = await prisma.order.findFirst({
    where: { 
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      customer: true,
      photographer: true,
      images: true
    }
  })

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  const oldStatus = order.status

  // Oppdater status
  const updatedOrder = await prisma.order.update({
    where: { id: params.id },
    data: { status }
  })

  // Send email basert på statusendring
  try {
    // Når ordre er fullført og klar for levering
    if (status === 'READY_FOR_DELIVERY' && oldStatus !== 'READY_FOR_DELIVERY') {
      const downloadUrl = `${env.NEXT_PUBLIC_APP_URL}/customer/download/${order.id}`
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 dager

      await emailQueue.send({
        type: 'order-completed',
        to: order.customer.email,
        subject: `Bildene dine er klare! Ordre #${order.orderNumber}`,
        customerName: order.customer.name,
        orderNumber: order.orderNumber,
        propertyAddress: order.propertyAddress,
        downloadUrl,
        expiresAt
      })
    }

    // Når fotograf blir tildelt
    if (status === 'ASSIGNED' && oldStatus === 'PENDING' && order.photographer) {
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
    }
  } catch (error) {
    console.error('Failed to send status update email:', error)
    // Ikke la email-feil stoppe status-oppdateringen
  }

  return NextResponse.json(updatedOrder)
})

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()

  // Verifiser at ordre tilhører brukerens company
  const order = await prisma.order.findFirst({
    where: { 
      id: params.id,
      companyId: session.user.companyId
    }
  })

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  // Slett ordre (cascade vil håndtere relaterte records)
  await prisma.order.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
})