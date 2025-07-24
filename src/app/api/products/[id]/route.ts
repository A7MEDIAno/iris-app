import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, NotFoundError, ValidationError } from '@/lib/errors'

// GET /api/products/[id]
export const GET = withErrorHandler(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  const product = await prisma.product.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    }
  })
  
  if (!product) {
    throw new NotFoundError('Produkt ikke funnet')
  }
  
  // Beregn fortjeneste
  const totalCost = Number(product.pke) + Number(product.pki) + Number(product.photographerFee)
  const profit = Number(product.priceExVat) - totalCost
  const profitMargin = Number(product.priceExVat) > 0 
    ? (profit / Number(product.priceExVat)) * 100 
    : 0
  
  return NextResponse.json({
    ...product,
    profit,
    profitMargin
  })
})

// PUT /api/products/[id]
export const PUT = withErrorHandler(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan oppdatere produkter')
  }
  
  const body = await request.json()
  
  // Sjekk at produkt eksisterer
  const existing = await prisma.product.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    }
  })
  
  if (!existing) {
    throw new NotFoundError('Produkt ikke funnet')
  }
  
  // Validering
  if (body.name && body.name.trim().length < 2) {
    throw new ValidationError('Produktnavn må være minst 2 tegn')
  }
  
  if (body.priceExVat !== undefined && body.priceExVat <= 0) {
    throw new ValidationError('Pris må være større enn 0')
  }
  
  if (body.vatRate !== undefined && (body.vatRate < 0 || body.vatRate > 100)) {
    throw new ValidationError('MVA-sats må være mellom 0 og 100')
  }
  
  // Sjekk SKU duplikater
  if (body.sku && body.sku !== existing.sku) {
    const duplicate = await prisma.product.findFirst({
      where: {
        companyId: session.user.companyId,
        sku: body.sku,
        NOT: { id: params.id }
      }
    })
    
    if (duplicate) {
      throw new ValidationError('Et annet produkt har allerede denne SKU')
    }
  }
  
  const updatedProduct = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.sku !== undefined && { sku: body.sku?.trim() || null }),
      ...(body.category !== undefined && { category: body.category || null }),
      ...(body.priceExVat !== undefined && { priceExVat: body.priceExVat }),
      ...(body.vatRate !== undefined && { vatRate: body.vatRate }),
      ...(body.pke !== undefined && { pke: body.pke }),
      ...(body.pki !== undefined && { pki: body.pki }),
      ...(body.photographerFee !== undefined && { photographerFee: body.photographerFee }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder })
    }
  })
  
  // Beregn fortjeneste
  const totalCost = Number(updatedProduct.pke) + Number(updatedProduct.pki) + Number(updatedProduct.photographerFee)
  const profit = Number(updatedProduct.priceExVat) - totalCost
  const profitMargin = Number(updatedProduct.priceExVat) > 0 
    ? (profit / Number(updatedProduct.priceExVat)) * 100 
    : 0
  
  return NextResponse.json({
    ...updatedProduct,
    profit,
    profitMargin
  })
})

// DELETE /api/products/[id]
export const DELETE = withErrorHandler(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan slette produkter')
  }
  
  // Sjekk at produkt eksisterer
  const product = await prisma.product.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      _count: {
        select: {
          orderProducts: true
        }
      }
    }
  })
  
  if (!product) {
    throw new NotFoundError('Produkt ikke funnet')
  }
  
  // Ikke tillat sletting hvis produktet er brukt i ordre
  if (product._count.orderProducts > 0) {
    throw new ValidationError(
      'Kan ikke slette produkt som er brukt i ordre. Deaktiver produktet i stedet.'
    )
  }
  
  // Soft delete - sett isActive til false
  await prisma.product.update({
    where: { id: params.id },
    data: { isActive: false }
  })
  
  return NextResponse.json({ message: 'Produkt deaktivert' })
})