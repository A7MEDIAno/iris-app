import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateRange = searchParams.get('range') || 'month'
    
    // Beregn datoer basert på range
    const now = new Date()
    let startDate = new Date()
    let previousStartDate = new Date()
    
    switch(dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        previousStartDate.setDate(now.getDate() - 14)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        previousStartDate.setMonth(now.getMonth() - 2)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        previousStartDate.setMonth(now.getMonth() - 6)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        previousStartDate.setFullYear(now.getFullYear() - 2)
        break
    }

    // Hent ordre for perioden
    const [currentOrders, previousOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          orderItems: true,
          customer: true
        }
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        },
        include: {
          orderItems: true
        }
      })
    ])

    // Beregn total omsetning
    const currentRevenue = currentOrders.reduce((sum, order) => 
      sum + order.orderItems.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0), 0
    )
    const previousRevenue = previousOrders.reduce((sum, order) => 
      sum + order.orderItems.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0), 0
    )

    // Beregn vekst
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    const orderGrowth = previousOrders.length > 0
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
      : 0

    // Gjennomsnittlig ordreverdi
    const avgOrderValue = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0
    const prevAvgOrderValue = previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0
    const avgOrderGrowth = prevAvgOrderValue > 0
      ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100
      : 0

    // Ordre etter status
    const ordersByStatus = {
      pending: currentOrders.filter(o => o.status === 'PENDING').length,
      assigned: currentOrders.filter(o => o.status === 'ASSIGNED').length,
      inProgress: currentOrders.filter(o => o.status === 'IN_PROGRESS').length,
      completed: currentOrders.filter(o => o.status === 'COMPLETED').length,
      cancelled: currentOrders.filter(o => o.status === 'CANCELLED').length
    }

    // Top kunder
    const customerStats = currentOrders.reduce((acc: any, order) => {
      if (!acc[order.customerId]) {
        acc[order.customerId] = {
          id: order.customerId,
          name: order.customer?.name || 'Ukjent',
          orders: 0,
          revenue: 0
        }
      }
      acc[order.customerId].orders += 1
      acc[order.customerId].revenue += order.orderItems.reduce((sum, item) => 
        sum + (item.unitPrice * item.quantity), 0
      )
      return acc
    }, {})

    const topCustomers = Object.values(customerStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)

    // Top fotografer
    const photographerOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        photographerId: { not: null }
      },
      include: {
        photographer: true,
        orderItems: true
      }
    })

    const photographerStats = photographerOrders.reduce((acc: any, order) => {
      const photId = order.photographerId!
      if (!acc[photId]) {
        acc[photId] = {
          id: photId,
          name: order.photographer?.name || 'Ukjent',
          orders: 0,
          revenue: 0
        }
      }
      acc[photId].orders += 1
      acc[photId].revenue += order.orderItems.reduce((sum, item) => 
        sum + (item.unitPrice * item.quantity), 0
      )
      return acc
    }, {})

    const topPhotographers = Object.values(photographerStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)

    // Månedlig data - forenklet versjon
    const monthlyData = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des']
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(now.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      
      const monthOrders = currentOrders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= monthStart && orderDate < monthEnd
      })
      
      const monthRevenue = monthOrders.reduce((sum, order) => 
        sum + order.orderItems.reduce((itemSum, item) => 
          itemSum + (item.unitPrice * item.quantity), 0
        ), 0
      )
      
      monthlyData.push({
        month: monthNames[monthStart.getMonth()],
        orders: monthOrders.length,
        revenue: monthRevenue
      })
    }

    return NextResponse.json({
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: revenueGrowth
      },
      orders: {
        current: currentOrders.length,
        previous: previousOrders.length,
        growth: orderGrowth
      },
      avgOrderValue: {
        current: avgOrderValue,
        previous: prevAvgOrderValue,
        growth: avgOrderGrowth
      },
      ordersByStatus,
      topCustomers,
      topPhotographers,
      monthlyData
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    )
  }
}