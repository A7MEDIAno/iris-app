import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError } from '@/lib/errors'

// GET /api/customers
export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const activeOnly = searchParams.get('activeOnly') === 'true'
  const skip = (page - 1) * limit

  // Bygg where-klausul
  const where = {
    companyId: session.user.companyId,
    ...(activeOnly && { isActive: true }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { orgNumber: { contains: search, mode: 'insensitive' as const } },
      ]
    })
  }

  // Hent kunder med pagination
  const [customers, total] = await prisma.$transaction([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      include: {
        contactPersons: {
          where: { isPrimary: true },
          take: 1
        },
        _count: {
          select: {
            orders: true,
            invoices: {
              where: { status: 'OVERDUE' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.count({ where })
  ])

  // Transform data for frontend
  const transformedCustomers = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    orgNumber: customer.orgNumber,
    primaryContact: customer.contactPersons[0] || null,
    orderCount: customer._count.orders,
    overdueInvoices: customer._count.invoices,
    isActive: customer.isActive,
    createdAt: customer.createdAt
  }))

  return NextResponse.json({
    customers: transformedCustomers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// POST /api/customers
export const POST = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  // Kun admin kan opprette kunder
  if (session.user.role !== 'ADMIN') {
    throw new ValidationError('Kun administratorer kan opprette kunder')
  }

  const body = await request.json()
  
  // Manuell validering istedenfor Zod
  if (!body.name || body.name.length < 2) {
    throw new ValidationError('Navn må være minst 2 tegn')
  }
  
  if (!body.email || !body.email.includes('@')) {
    throw new ValidationError('Ugyldig e-postadresse')
  }
  
  // Sett default verdier
  const customerData = {
    name: body.name,
    email: body.email,
    phone: body.phone || null,
    orgNumber: body.orgNumber || null,
    invoiceEmail: body.invoiceEmail || body.email,
    invoiceAddress: body.invoiceAddress || null,
    invoiceZip: body.invoiceZip || null,
    invoiceCity: body.invoiceCity || null,
    deliveryAddress: body.deliveryAddress || null,
    deliveryZip: body.deliveryZip || null,
    deliveryCity: body.deliveryCity || null,
    notes: body.notes || null,
    paymentTerms: body.paymentTerms || 14,
    creditLimit: body.creditLimit || 0,
    companyId: session.user.companyId
  }
  
  // Sjekk for duplikater
  const existing = await prisma.customer.findFirst({
    where: {
      companyId: session.user.companyId,
      OR: [
        { email: customerData.email },
        ...(customerData.orgNumber ? [{ orgNumber: customerData.orgNumber }] : [])
      ]
    }
  })

  if (existing) {
    throw new ValidationError(
      existing.email === customerData.email 
        ? 'En kunde med denne e-postadressen eksisterer allerede'
        : 'En kunde med dette organisasjonsnummeret eksisterer allerede'
    )
  }

  // Valider organisasjonsnummer hvis oppgitt
  if (customerData.orgNumber) {
    const cleanedNumber = customerData.orgNumber.replace(/\s/g, '')
    if (!/^\d{9}$/.test(cleanedNumber)) {
      throw new ValidationError('Ugyldig organisasjonsnummer')
    }
  }

  // Opprett kunde med kontaktpersoner i en transaksjon
  const customer = await prisma.$transaction(async (tx) => {
    // Opprett kunde
    const newCustomer = await tx.customer.create({
      data: customerData
    })

    // Opprett kontaktpersoner hvis oppgitt
    if (body.contactPersons && Array.isArray(body.contactPersons) && body.contactPersons.length > 0) {
      const validContactPersons = body.contactPersons.filter((c: any) => c.name && c.email)
      
      if (validContactPersons.length > 0) {
        await tx.contactPerson.createMany({
          data: validContactPersons.map((contact: any, index: number) => ({
            name: contact.name,
            email: contact.email,
            phone: contact.phone || null,
            role: contact.role || null,
            customerId: newCustomer.id,
            isPrimary: index === 0
          }))
        })
      }
    }

    // Hent kunde med relasjoner
    return await tx.customer.findUnique({
      where: { id: newCustomer.id },
      include: {
        contactPersons: true
      }
    })
  })

  return NextResponse.json(customer, { status: 201 })
})