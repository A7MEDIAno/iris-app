import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { getCurrentCompany } from '../../../lib/auth/session'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const company = await getCurrentCompany() || await prisma.company.findFirst()
    
    if (!company) {
      return NextResponse.json([])
    }

    const photographers = await prisma.user.findMany({
      where: { 
        companyId: company.id,
        role: { in: ['PHOTOGRAPHER', 'EDITOR'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        baseAddress: true,
        createdAt: true,
        _count: {
          select: {
            assignedOrders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Transform data to include order counts
    const photographersWithStats = photographers.map(p => ({
      ...p,
      totalOrders: p._count.assignedOrders,
      completedOrders: 0, // TODO: Add completed count
      isActive: true // TODO: Add isActive field to schema
    }))
    
    return NextResponse.json(photographersWithStats)
  } catch (error) {
    console.error('Error fetching photographers:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente fotografer' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  console.log('POST /api/photographers called')
  
  try {
    const company = await getCurrentCompany() || await prisma.company.findFirst()
    console.log('Company:', company)
    
    if (!company) {
      return NextResponse.json(
        { error: 'Ingen firma funnet' },
        { status: 400 }
      )
    }

    const data = await req.json()
    console.log('Received data:', data)
    
    // Sjekk om email eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      return NextResponse.json(
        { error: 'E-post er allerede i bruk' },
        { status: 400 }
      )
    }
    
    // Hash passord
    const hashedPassword = await bcrypt.hash(data.password, 12)
    console.log('Password hashed')
    
    const photographer = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword,
        baseAddress: data.baseAddress || null,
        role: data.role || 'PHOTOGRAPHER',
        companyId: company.id
      }
    })
    console.log('Photographer created:', photographer)
    
    // Returner uten passord
    const { password, ...photographerWithoutPassword } = photographer
    
    return NextResponse.json(photographerWithoutPassword)
  } catch (error: any) {
    console.error('Create photographer error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    
    return NextResponse.json(
      { 
        error: error.message || 'Kunne ikke opprette fotograf'
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'