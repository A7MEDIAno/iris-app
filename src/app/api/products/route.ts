import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError } from '@/lib/errors'

// GET /api/products
export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const activeOnly = searchParams.get('activeOnly') !== 'false'
  
  const products = await prisma.product.findMany({
    where: { 
      companyId: session.user.companyId,
      ...(category && { category }),
      ...(activeOnly && { isActive: true })
    },
    orderBy: [
      { category: 'asc' },
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  })
  
  // Grupper produkter etter kategori
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Ukategorisert'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {} as Record<string, typeof products>)
  
  return NextResponse.json({ 
    products,
    groupedProducts,
    categories: Object.keys(groupedProducts)
  })
})

// POST /api/products
export const POST = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  // Kun admin kan opprette produkter
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan opprette produkter')
  }
  
  const body = await request.json()
  
  // Validering
  if (!body.name || body.name.trim().length < 2) {
    throw new ValidationError('Produktnavn må være minst 2 tegn')
  }
  
  if (!body.priceExVat || body.priceExVat <= 0) {
    throw new ValidationError('Pris må være større enn 0')
  }
  
  if (body.vatRate && (body.vatRate < 0 || body.vatRate > 100)) {
    throw new ValidationError('MVA-sats må være mellom 0 og 100')
  }
  
  // Beregn fortjeneste
  const pke = Number(body.pke || 0)
  const pki = Number(body.pki || 0)
  const photographerFee = Number(body.photographerFee || 0)
  const price = Number(body.priceExVat)
  
  const totalCost = pke + pki + photographerFee
  const profit = price - totalCost
  const profitMargin = price > 0 ? (profit / price) * 100 : 0
  
  // Sjekk for duplikater
  if (body.sku) {
    const existing = await prisma.product.findFirst({
      where: {
        companyId: session.user.companyId,
        sku: body.sku
      }
    })
    
    if (existing) {
      throw new ValidationError('Et produkt med denne SKU finnes allerede')
    }
  }
  
  // Finn høyeste sortOrder i samme kategori
  const maxSortOrder = await prisma.product.findFirst({
    where: {
      companyId: session.user.companyId,
      category: body.category || null
    },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true }
  })
  
  const product = await prisma.product.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      sku: body.sku?.trim() || null,
      category: body.category || null,
      priceExVat: price,
      vatRate: body.vatRate || 25,
      pke: pke,
      pki: pki,
      photographerFee: photographerFee,
      isActive: body.isActive ?? true,
      sortOrder: (maxSortOrder?.sortOrder || 0) + 1,
      companyId: session.user.companyId
    }
  })
  
  return NextResponse.json({
    ...product,
    profit,
    profitMargin
  }, { status: 201 })
})