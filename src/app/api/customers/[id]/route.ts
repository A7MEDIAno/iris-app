import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, NotFoundError, ValidationError } from '@/lib/errors'
import { z } from 'zod'

// Valideringsskjema for oppdatering
const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  orgNumber: z.string().optional(),
  invoiceEmail: z.string().email().optional().or(z.literal('')),
  invoiceAddress: z.string().optional(),
  invoiceZip: z.string().optional(),
  invoiceCity: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryZip: z.string().optional(),
  deliveryCity: z.string().optional(),
  notes: z.string().optional(),
  paymentTerms: z.number().min(0).max(90).optional(),
  creditLimit: z.number().min(0).optional(),
  isActive: z.boolean().optional()
})

// GET /api/customers/[id]
export const GET = withErrorHandler(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  const customer = await prisma.customer.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      contactPersons: {
        orderBy: { isPrimary: 'desc' }
      },
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          photographer: {
            select: { name: true }
          }
        }
      },
      invoices: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          orders: true,
          invoices: true
        }
      }
    }
  })

  if (!customer) {
    throw new NotFoundError('Kunde ikke funnet')
  }

  // Beregn statistikk
  const stats = await prisma.$transaction([
    // Total omsetning
    prisma.invoice.aggregate({
      where: {
        customerId: params.id,
        status: 'PAID'
      },
      _sum: { total: true }
    }),
    // Utestående beløp
    prisma.invoice.aggregate({
      where: {
        customerId: params.id,
        status: { in: ['SENT', 'OVERDUE'] }
      },
      _sum: { total: true }
    }),
    // Gjennomsnittlig ordrestørrelse (placeholder - må legges til totalAmount i Order)
    prisma.order.count({
      where: { customerId: params.id }
    })
  ])

  const enrichedCustomer = {
    ...customer,
    stats: {
      totalRevenue: Number(stats[0]._sum.total || 0),
      outstandingAmount: Number(stats[1]._sum.total || 0),
      averageOrderValue: 0, // Placeholder
      totalOrders: customer._count.orders,
      totalInvoices: customer._count.invoices
    }
  }

  return NextResponse.json(enrichedCustomer)
})

// PUT /api/customers/[id]
export const PUT = withErrorHandler(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  // Kun admin kan oppdatere kunder
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan oppdatere kunder')
  }

  const body = await request.json()
  const validatedData = updateCustomerSchema.parse(body)

  // Sjekk at kunde eksisterer og tilhører samme company
  const existing = await prisma.customer.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    }
  })

  if (!existing) {
    throw new NotFoundError('Kunde ikke funnet')
  }

  // Sjekk for duplikater hvis email eller orgNumber endres
  if (validatedData.email || validatedData.orgNumber) {
    const duplicate = await prisma.customer.findFirst({
      where: {
        companyId: session.user.companyId,
        NOT: { id: params.id },
        OR: [
          ...(validatedData.email ? [{ email: validatedData.email }] : []),
          ...(validatedData.orgNumber ? [{ orgNumber: validatedData.orgNumber }] : [])
        ]
      }
    })

    if (duplicate) {
      throw new ValidationError(
        duplicate.email === validatedData.email 
          ? 'En annen kunde har allerede denne e-postadressen'
          : 'En annen kunde har allerede dette organisasjonsnummeret'
      )
    }
  }

  // Oppdater kunde
  const updatedCustomer = await prisma.customer.update({
    where: { id: params.id },
    data: validatedData,
    include: {
      contactPersons: true
    }
  })

  return NextResponse.json(updatedCustomer)
})

// DELETE /api/customers/[id]
export const DELETE = withErrorHandler(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  const session = await requireAuth()
  
  // Kun admin kan slette kunder
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan slette kunder')
  }

  // Sjekk at kunde eksisterer
  const customer = await prisma.customer.findFirst({
    where: {
      id: params.id,
      companyId: session.user.companyId
    },
    include: {
      _count: {
        select: {
          orders: true,
          invoices: true
        }
      }
    }
  })

  if (!customer) {
    throw new NotFoundError('Kunde ikke funnet')
  }

  // Ikke tillat sletting hvis kunde har ordre eller fakturaer
  if (customer._count.orders > 0 || customer._count.invoices > 0) {
    throw new ValidationError(
      'Kan ikke slette kunde med eksisterende ordre eller fakturaer. Deaktiver kunden i stedet.'
    )
  }

  // Soft delete - sett isActive til false
  await prisma.customer.update({
    where: { id: params.id },
    data: { isActive: false }
  })

  return NextResponse.json({ message: 'Kunde deaktivert' })
})