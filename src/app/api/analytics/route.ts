import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'

// Marker route som dynamic
export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (request: NextRequest) => {
  try {
    const session = await requireAuth()
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ 
        error: 'No company ID in session' 
      }, { status: 401 })
    }
    
    const { searchParams } = request.nextUrl
    const period = searchParams.get('period') || '30'
    const range = searchParams.get('range') || 'days'
    
    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    
    // Sjekk at company eksisterer
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId }
    })
    
    if (!company) {
      return NextResponse.json({ 
        error: 'Company not found' 
      }, { status: 404 })
    }
    
    // Hent statistikk med error handling
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
      }).catch(() => 0),
      
      // Fullførte ordre
      prisma.order.count({
        where: { 
          companyId: session.user.companyId,
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }).catch(() => 0),
      
      // Unike kunder
      prisma.customer.count({
        where: { 
          companyId: session.user.companyId,
          createdAt: { gte: startDate }
        }
      }).catch(() => 0),
      
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
      }).catch(() => 0),
      
      // Ordre fordelt på status
      prisma.order.groupBy({
        by: ['status'],
        where: { 
          companyId: session.user.companyId,
          createdAt: { gte: startDate }
        },
        _count: true
      }).catch(() => []),
      
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
      }).catch(() => []),
      
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
      }).catch(() => [])
    ])
    
    return NextResponse.json({
      overview: {
        totalOrders,
        completedOrders,
        totalCustomers,
        activePhotographers,
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
      },
      ordersByStatus: Array.isArray(ordersByStatus) ? ordersByStatus.map(item => ({
        status: item.status,
        count: item._count
      })) : [],
      ordersByPhotographer: Array.isArray(ordersByPhotographer) ? ordersByPhotographer.map(photographer => ({
        name: photographer.name,
        count: photographer._count.orders
      })) : [],
      recentOrders: Array.isArray(recentOrders) ? recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        photographerName: order.photographer?.name,
        status: order.status,
        createdAt: order.createdAt
      })) : []
    })
  } catch (error) {
    console.error('Analytics error:', error)
    
    // Return default data structure on error
    return NextResponse.json({
      overview: {
        totalOrders: 0,
        completedOrders: 0,
        totalCustomers: 0,
        activePhotographers: 0,
        completionRate: 0
      },
      ordersByStatus: [],
      ordersByPhotographer: [],
      recentOrders: []
    })
  }
})