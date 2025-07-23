import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { getCurrentCompany } from '../../../lib/auth/session'

export async function GET() {
  try {
    const company = await getCurrentCompany()
    if (!company) {
      // For testing, bruk første company eller opprett en default
      const defaultCompany = await prisma.company.findFirst() || 
        await prisma.company.create({
          data: {
            name: 'A7 MEDIA',
            orgNumber: '123456789',
            subdomain: 'a7media'
          }
        })
      
      const customers = await prisma.customer.findMany({
        where: { companyId: defaultCompany.id },
        orderBy: { createdAt: 'desc' }
      })
      
      return NextResponse.json(customers)
    }

    const customers = await prisma.customer.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente kunder' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const company = await getCurrentCompany()
    const defaultCompany = company || await prisma.company.findFirst()
    
    if (!defaultCompany) {
      return NextResponse.json(
        { error: 'Ingen firma funnet' },
        { status: 400 }
      )
    }

    const data = await req.json()
    
    const customer = await prisma.customer.create({
      data: {
        ...data,
        companyId: defaultCompany.id
      }
    })
    
    return NextResponse.json(customer)
  } catch (error: any) {
    console.error('Create customer error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kunde finnes allerede' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Kunne ikke opprette kunde' },
      { status: 500 }
    )
  }
}