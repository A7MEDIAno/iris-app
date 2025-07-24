import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, NotFoundError, ValidationError } from '@/lib/errors'
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
      orderProducts: {
        include: {
          product: true
        }
      },
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
    throw new NotFoundError('Ordre ikke funnet')
  }

  // Beregn ekstra info for frontend
  const orderWithCalculations = {
    ...order,
    calculations: {
      subtotal: Number(order.totalAmount || 0),
      vatAmount: Number(order.vatAmount || 0),
      totalIncVat: Number(order.totalAmount || 0) + Number(order.vatAmount || 0),
      photographerFee: Number(order.photographerFee || 0),
      companyProfit: Number(order.companyProfit || 0),
      profitMargin: Number(order.totalAmount) > 0 
        ? (Number(order.companyProfit || 0) / Number(order.totalAmount)) * 100 
        : 0
    }
  }

  return NextResponse.json(orderWithCalculations)
})

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  const body = await request.json()
  const { status, photographerId } = body

  // Finn ordre med all nødvendig info
  const order = await prisma.order.findFirst({
    where: { 
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      customer: true,
      photographer: true,
      orderProducts: {
        include: {
          product: true
        }
      },
      images: true
    }
  })

  if (!order) {
    throw new NotFoundError('Ordre ikke funnet')
  }

  const oldStatus = order.status
  const oldPhotographerId = order.photographerId

  // Bygg update data
  const updateData: any = {}
  if (status !== undefined) updateData.status = status
  if (photographerId !== undefined) updateData.photographerId = photographerId

  // Oppdater ordre
  const updatedOrder = await prisma.order.update({
    where: { id: params.id },
    data: updateData,
    include: {
      customer: true,
      photographer: true,
      orderProducts: {
        include: {
          product: true
        }
      }
    }
  })

  // Send email basert på endringer
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
        expiresAt,
        products: order.orderProducts.map(op => ({
          name: op.product.name,
          quantity: op.quantity
        }))
      })
    }

    // Når fotograf blir tildelt eller endret
    if (photographerId && photographerId !== oldPhotographerId && updatedOrder.photographer) {
      await emailQueue.send({
        type: 'photographer-assigned',
        to: updatedOrder.photographer.email,
        subject: `Nytt oppdrag: ${order.propertyAddress}`,
        photographerName: updatedOrder.photographer.name,
        orderNumber: order.orderNumber,
        propertyAddress: order.propertyAddress,
        scheduledDate: order.scheduledDate,
        customerName: order.customer.name,
        customerPhone: order.customer.phone || undefined,
        photographerFee: Number(order.photographerFee),
        products: order.orderProducts.map(op => ({
          name: op.product.name,
          quantity: op.quantity
        }))
      })
    }
  } catch (error) {
    console.error('Failed to send status update email:', error)
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
    },
    include: {
      _count: {
        select: {
          orderProducts: true,
          images: true
        }
      }
    }
  })

  if (!order) {
    throw new NotFoundError('Ordre ikke funnet')
  }

  // Ikke tillat sletting av ordre med bilder
  if (order._count.images > 0) {
    throw new ValidationError('Kan ikke slette ordre som har opplastede bilder')
  }

  // Slett ordre (cascade vil håndtere orderProducts)
  await prisma.order.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
})

// NY ENDPOINT: Oppdater produkter på eksisterende ordre
export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  const body = await request.json()
  
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan endre produkter på ordre')
  }

  const order = await prisma.order.findFirst({
    where: { 
      id: params.id,
      companyId: session.user.companyId
    }
  })

  if (!order) {
    throw new NotFoundError('Ordre ikke funnet')
  }

  if (order.status !== 'PENDING' && order.status !== 'ASSIGNED') {
    throw new ValidationError('Kan ikke endre produkter på ordre som er i produksjon')
  }

  // Samme logikk som POST for å beregne nye totaler
  const productIds = body.products.map((p: any) => p.productId)
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      companyId: session.user.companyId,
      isActive: true
    }
  })

  // Beregn nye totaler
  let totalAmount = 0
  let totalPhotographerFee = 0
  let totalPke = 0
  let totalPki = 0
  
  const orderProductsData = body.products.map((item: any) => {
    const product = products.find(p => p.id === item.productId)
    if (!product) throw new ValidationError(`Produkt ${item.productId} ikke funnet`)
    
    const quantity = item.quantity || 1
    const unitPrice = Number(product.priceExVat)
    const lineTotal = unitPrice * quantity
    
    totalAmount += lineTotal
    totalPke += Number(product.pke) * quantity
    totalPki += Number(product.pki) * quantity
    totalPhotographerFee += Number(product.photographerFee) * quantity
    
    return {
      productId: product.id,
      quantity,
      unitPrice,
      totalPrice: lineTotal
    }
  })

  const vatAmount = totalAmount * 0.25
  const totalCosts = totalPke + totalPki + totalPhotographerFee
  const companyProfit = totalAmount - totalCosts

  // Oppdater ordre og produkter i transaksjon
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Slett eksisterende orderProducts
    await tx.orderProduct.deleteMany({
      where: { orderId: params.id }
    })

    // Opprett nye orderProducts og oppdater ordre
    return await tx.order.update({
      where: { id: params.id },
      data: {
        totalAmount,
        vatAmount,
        photographerFee: totalPhotographerFee,
        companyProfit,
        orderProducts: {
          create: orderProductsData
        }
      },
      include: {
        customer: true,
        photographer: true,
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    })
  })

  return NextResponse.json(updatedOrder)
})