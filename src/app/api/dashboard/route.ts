import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'

export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month' // month eller year
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
  
  // Beregn datoperiode
  let startDate: Date
  let endDate: Date
  
  if (period === 'year') {
    startDate = new Date(year, 0, 1)
    endDate = new Date(year, 11, 31, 23, 59, 59)
  } else {
    startDate = new Date(year, month - 1, 1)
    endDate = new Date(year, month, 0, 23, 59, 59)
  }
  
  // Hent alle ordre med produkter for perioden
  const orders = await prisma.order.findMany({
    where: {
      companyId: session.user.companyId,
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        notIn: ['CANCELLED']
      }
    },
    include: {
      orderProducts: {
        include: {
          product: true
        }
      }
    }
  })
  
  // Beregn totaler
  let totalRevenue = 0
  let totalProfit = 0
  let totalPhotographerFee = 0
  let totalPke = 0
  let totalPki = 0
  let totalVat = 0
  
  orders.forEach(order => {
    const orderRevenue = Number(order.totalAmount || 0)
    const orderVat = Number(order.vatAmount || 0)
    const orderPhotographerFee = Number(order.photographerFee || 0)
    const orderProfit = Number(order.companyProfit || 0)
    
    totalRevenue += orderRevenue
    totalVat += orderVat
    totalPhotographerFee += orderPhotographerFee
    totalProfit += orderProfit
    
    // Beregn PKE og PKI fra produkter
    order.orderProducts.forEach(op => {
      totalPke += Number(op.product.pke) * op.quantity
      totalPki += Number(op.product.pki) * op.quantity
    })
  })
  
  // Linjediagram data
  let chartData: any[] = []
  
  if (period === 'year') {
    // Månedlig data for hele året
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1)
      const monthEnd = new Date(year, i + 1, 0, 23, 59, 59)
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= monthStart && orderDate <= monthEnd
      })
      
      const monthRevenue = monthOrders.reduce((sum, order) => 
        sum + Number(order.totalAmount || 0), 0
      )
      
      const monthProfit = monthOrders.reduce((sum, order) => 
        sum + Number(order.companyProfit || 0), 0
      )
      
      chartData.push({
        name: new Date(year, i).toLocaleDateString('nb-NO', { month: 'short' }),
        måned: i + 1,
        omsetning: monthRevenue,
        fortjeneste: monthProfit,
        antallOrdre: monthOrders.length
      })
    }
  } else {
    // Daglig data for måneden
    const daysInMonth = new Date(year, month, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month - 1, day)
      const dayEnd = new Date(year, month - 1, day, 23, 59, 59)
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dayStart && orderDate <= dayEnd
      })
      
      const dayRevenue = dayOrders.reduce((sum, order) => 
        sum + Number(order.totalAmount || 0), 0
      )
      
      const dayProfit = dayOrders.reduce((sum, order) => 
        sum + Number(order.companyProfit || 0), 0
      )
      
      chartData.push({
        name: day.toString(),
        dag: day,
        omsetning: dayRevenue,
        fortjeneste: dayProfit,
        antallOrdre: dayOrders.length
      })
    }
  }
  
  // Kakediagram data
  const pieData = [
    { name: 'Fotografhonorar', value: totalPhotographerFee, color: '#3B82F6' },
    { name: 'PKE', value: totalPke, color: '#8B5CF6' },
    { name: 'PKI', value: totalPki, color: '#F59E0B' },
    { name: 'Fortjeneste', value: totalProfit, color: '#10B981' }
  ].filter(item => item.value > 0) // Fjern 0-verdier
  
  // Status på ordre
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    where: {
      companyId: session.user.companyId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _count: {
      status: true
    }
  })
  
  // Top produkter
  const productStats = new Map()
  orders.forEach(order => {
    order.orderProducts.forEach(op => {
      const key = op.product.id
      if (!productStats.has(key)) {
        productStats.set(key, {
          name: op.product.name,
          quantity: 0,
          revenue: 0
        })
      }
      const stats = productStats.get(key)
      stats.quantity += op.quantity
      stats.revenue += Number(op.totalPrice)
    })
  })
  
  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  
  return NextResponse.json({
    summary: {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      totalRevenue,
      totalRevenueIncVat: totalRevenue + totalVat,
      totalProfit,
      totalPhotographerFee,
      totalPke,
      totalPki,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    },
    chartData,
    pieData,
    ordersByStatus: ordersByStatus.map(item => ({
      status: item.status,
      count: item._count.status
    })),
    topProducts,
    period: {
      type: period,
      year,
      month,
      startDate,
      endDate
    }
  })
})