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

  // Tilgangskontroll - Admin ser alle, fotografer ser kun sine
  const where = session.user.role === 'ADMIN' 
    ? { companyId: session.user.companyId }
    : { 
        companyId: session.user.companyId,
        photographerId: session.user.id 
      }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where, // Bruker where-variabelen her
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
        },
        orderProducts: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.count({
      where // Også her for riktig total
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
    totalAmount: Number(order.totalAmount || 0),
    productCount: order.orderProducts.length
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

// POST endpoint forblir uendret
export const POST = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  const body = await request.json()
  
  // Valider input
  if (!body.customerId || !body.propertyAddress) {
    throw new ValidationError('Kunde og adresse er påkrevd')
  }
  
  if (!body.products || body.products.length === 0) {
    throw new ValidationError('Du må velge minst ett produkt')
  }
  
  const scheduledDate = new Date(`${body.scheduledDate}T${body.scheduledTime || '12:00'}`)
  
  // Hent produkter for å beregne priser
  const productIds = body.products.map((p: any) => p.productId)
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      companyId: session.user.companyId,
      isActive: true
    }
  })
  
  if (products.length !== productIds.length) {
    throw new ValidationError('Ett eller flere produkter er ikke tilgjengelige')
  }
  
  // Beregn totaler
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
  
  const vatAmount = totalAmount * 0.25 // 25% MVA
  const totalCosts = totalPke + totalPki + totalPhotographerFee
  const companyProfit = totalAmount - totalCosts
  
  // Opprett ordre med produkter i en transaksjon
  const order = await prisma.$transaction(async (tx) => {
    // Opprett ordre
    const newOrder = await tx.order.create({
      data: {
        customerId: body.customerId,
        propertyAddress: body.propertyAddress,
        propertyType: body.propertyType || null,
        scheduledDate,
        priority: body.priority || 'NORMAL',
        status: 'PENDING',
        companyId: session.user.companyId,
        createdById: session.user.id,
        photographerId: body.photographerId,
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
    
    return newOrder
  })
  
  // Send ordrebekreftelse email
  try {
    const orderTotal = Number(order.totalAmount) + Number(order.vatAmount || 0)
    
    await emailQueue.send({
      type: 'order-confirmation',
      to: order.customer.email,
      subject: `Ordrebekreftelse #${order.orderNumber}`,
      customerName: order.customer.name,
      orderNumber: order.orderNumber,
      propertyAddress: order.propertyAddress,
      scheduledDate: order.scheduledDate,
      photographerName: order.photographer?.name,
      totalAmount: orderTotal,
      products: order.orderProducts.map(op => ({
        name: op.product.name,
        quantity: op.quantity,
        price: Number(op.unitPrice)
      }))
    })
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
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
        customerPhone: order.customer.phone || undefined,
        photographerFee: Number(order.photographerFee)
      })
    } catch (error) {
      console.error('Failed to send photographer notification:', error)
    }
  }
  
  return NextResponse.json(order)
})

export const dynamic = 'force-dynamic'