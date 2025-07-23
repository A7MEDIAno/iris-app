import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { getCurrentCompany } from '../../../lib/auth/session'

export async function GET() {
  try {
    const company = await getCurrentCompany() || await prisma.company.findFirst()
    
    if (!company) {
      return NextResponse.json([])
    }

    const products = await prisma.product.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Kunne ikke hente produkter' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const company = await getCurrentCompany() || await prisma.company.findFirst()
    
    if (!company) {
      return NextResponse.json(
        { error: 'Ingen firma funnet' },
        { status: 400 }
      )
    }

    const data = await req.json()
    
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        priceExVat: data.priceExVat,
        vatRate: data.vatRate || 25,
        pke: data.pke || 0,
        pki: data.pki || 0,
        photographerFee: data.photographerFee || 0,
        isActive: data.isActive ?? true,
        companyId: company.id
      }
    })
    
    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Create product error:', error)
    
    return NextResponse.json(
      { error: 'Kunne ikke opprette produkt' },
      { status: 500 }
    )
  }
}