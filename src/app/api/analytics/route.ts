import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'

// Marker route som dynamic
export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (request: NextRequest) => {
  const session = await requireAuth()
  
  const { searchParams } = request.nextUrl
  const period = searchParams.get('period') || '30'
  
  const daysAgo = parseInt(period)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysAgo)
  
  // Hent statistikk
  const [
    totalOrders,
    completedOrders,
    totalCustomers,
    activePhotographers,
    ordersByStatus,
    ordersByPhotographer,
    recentOrders
  ] = await Promise.all([
    // Total orders i perioden
    prisma.order.count({
      where: { 
        companyId: session.user.companyId,
        createdAt: { gte: startDate }
      }
    }),
    
    // Fullførte ordre
    prisma.order.count({
      where: { 
        companyId: session.user.companyId,
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      }
    }),
    
    // Unike kunder
    prisma.customer.count({
      where: { 
        companyId: session.user.companyId,
        createdAt: { gte: startDate }
      }
    }),
    
    // Aktive fotografer
    prisma.user.count({
      where: {
        companyId: session.user.companyId,
        role: 'PHOTOGRAPHER',
        orders: {
          some: {
            createdAt: { gte: startDate }
          }
        }
      }
    }),
    
    // Ordre fordelt på status
    prisma.order.groupBy({
      by: ['status'],
      where: { 
        companyId: session.user.companyId,
        createdAt: { gte: startDate }
      },
      _count: true
    }),
    
    // Ordre per fotograf
    prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
        role: 'PHOTOGRAPHER'
      },
      select: {
        name: true,
        _count: {
          select: {
            orders: {
              where: {
                createdAt: { gte: startDate }
              }
            }
          }
        }
      }
    }),
    
    // Siste 10 ordre
    prisma.order.findMany({
      where: { 
        companyId: session.user.companyId 
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        photographer: true
      }
    })
  ])
  
  return NextResponse.json({
    overview: {
      totalOrders,
      completedOrders,
      totalCustomers,
      activePhotographers,
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    },
    ordersByStatus: ordersByStatus.map(item => ({
      status: item.status,
      count: item._count
    })),
    ordersByPhotographer: ordersByPhotographer.map(photographer => ({
      name: photographer.name,
      count: photographer._count.orders
    })),
    recentOrders: recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      photographerName: order.photographer?.name,
      status: order.status,
      createdAt: order.createdAt
    }))
  })
})