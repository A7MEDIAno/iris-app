import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { getCurrentCompany, getCurrentUser } from '../../../lib/auth/session'

export async function GET() {
  try {
    const company = await getCurrentCompany() || await prisma.company.findFirst()
    
    if (!company) {
      return NextResponse.json([])
    }

    const orders = await prisma.order.findMany({
      where: { companyId: company.id },
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
    })
    
    // Transform data til format som frontend forventer
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber.toString(),
      customerName: order.customer.name,
      photographerName: order.photographer?.name,
      propertyAddress: order.propertyAddress,
      shootDate: order.scheduledDate,
      status: order.status,
      totalAmount: 0 // Eller beregn fra orderItems hvis du har det
    }))
    
    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente oppdrag' },
      { status: 500 }
    )
  }
}

// POST forblir uendret
export async function POST(req: Request) {
  // ... din eksisterende kode
}