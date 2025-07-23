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
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente oppdrag' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Hent eller opprett company
    let company = await getCurrentCompany() || await prisma.company.findFirst()
    
    if (!company) {
      console.log('No company found, creating default...')
      company = await prisma.company.create({
        data: {
          name: 'A7 MEDIA',
          orgNumber: '123456789',
          subdomain: 'a7media'
        }
      })
    }
    
    // Hent eller opprett user
    let user = await getCurrentUser() || await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    
    if (!user) {
      console.log('No user found, creating default admin...')
      user = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@a7media.no',
          password: 'temp123', // Midlertidig
          role: 'ADMIN',
          companyId: company.id
        }
      })
    }

    const data = await req.json()
    console.log('Creating order with data:', data)
    
    // Kombiner dato og tid
    const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime || '12:00'}`)
    
    const order = await prisma.order.create({
      data: {
        customerId: data.customerId,
        propertyAddress: data.propertyAddress,
        propertyType: data.propertyType || null,
        scheduledDate: scheduledDateTime,
        priority: data.priority || 'NORMAL',
        status: 'PENDING',
        companyId: company.id,
        createdById: user.id
      },
      include: {
        customer: true
      }
    })
    
    console.log('Order created:', order)
    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Create order error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Kunne ikke opprette oppdrag' },
      { status: 500 }
    )
  }
}