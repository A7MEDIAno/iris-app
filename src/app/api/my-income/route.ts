import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'

export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
  
  // Beregn periode
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)
  
  // Hent fullførte ordre for fotografen i perioden
  const orders = await prisma.order.findMany({
    where: {
      photographerId: session.user.id,
      status: 'COMPLETED',
      updatedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      orderNumber: true,
      propertyAddress: true,
      updatedAt: true,
      photographerFee: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
  
  // Beregn totaler
  const totalEarned = orders.reduce((sum, order) => 
    sum + Number(order.photographerFee || 0), 0
  )
  
  return NextResponse.json({
    totalEarned,
    totalOrders: orders.length,
    orderDetails: orders.map(order => ({
      orderNumber: order.orderNumber,
      propertyAddress: order.propertyAddress,
      completedDate: order.updatedAt,
      photographerFee: Number(order.photographerFee || 0)
    }))
  })
})