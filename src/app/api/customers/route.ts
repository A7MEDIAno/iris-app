import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError } from '@/lib/errors'
import { z } from 'zod'

// Valideringsskjema
const createCustomerSchema = z.object({
  name: z.string().min(2, 'Navn må være minst 2 tegn'),
  email: z.string().email('Ugyldig e-postadresse'),
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
  paymentTerms: z.number().min(0).max(90).default(14),
  creditLimit: z.number().min(0).optional(),
  contactPersons: z.array(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.string().optional(),
    isPrimary: z.boolean().default(false)
  })).optional()
})

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
  
  // Valider input
  const validatedData = createCustomerSchema.parse(body)
  
  // Sjekk for duplikater
  const existing = await prisma.customer.findFirst({
    where: {
      companyId: session.user.companyId,
      OR: [
        { email: validatedData.email },
        ...(validatedData.orgNumber ? [{ orgNumber: validatedData.orgNumber }] : [])
      ]
    }
  })

  if (existing) {
    throw new ValidationError(
      existing.email === validatedData.email 
        ? 'En kunde med denne e-postadressen eksisterer allerede'
        : 'En kunde med dette organisasjonsnummeret eksisterer allerede'
    )
  }

  // Valider organisasjonsnummer hvis oppgitt
  if (validatedData.orgNumber) {
    const isValidOrgNumber = await validateOrgNumber(validatedData.orgNumber)
    if (!isValidOrgNumber) {
      throw new ValidationError('Ugyldig organisasjonsnummer')
    }
  }

  // Opprett kunde med kontaktpersoner i en transaksjon
  const customer = await prisma.$transaction(async (tx) => {
    // Opprett kunde
    const newCustomer = await tx.customer.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        orgNumber: validatedData.orgNumber,
        invoiceEmail: validatedData.invoiceEmail || validatedData.email,
        invoiceAddress: validatedData.invoiceAddress,
        invoiceZip: validatedData.invoiceZip,
        invoiceCity: validatedData.invoiceCity,
        deliveryAddress: validatedData.deliveryAddress,
        deliveryZip: validatedData.deliveryZip,
        deliveryCity: validatedData.deliveryCity,
        notes: validatedData.notes,
        paymentTerms: validatedData.paymentTerms,
        creditLimit: validatedData.creditLimit,
        companyId: session.user.companyId
      }
    })

    // Opprett kontaktpersoner hvis oppgitt
    if (validatedData.contactPersons && validatedData.contactPersons.length > 0) {
      await tx.contactPerson.createMany({
        data: validatedData.contactPersons.map((contact, index) => ({
          ...contact,
          customerId: newCustomer.id,
          isPrimary: index === 0 // Første kontakt er primary
        }))
      })
    }

    // Hent kunde med relasjoner
    return await tx.customer.findUnique({
      where: { id: newCustomer.id },
      include: {
        contactPersons: true
      }
    })
  })

  // Send velkomst-epost
  try {
    await sendWelcomeEmail(customer)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    // Ikke la email-feil stoppe kunde-opprettelsen
  }

  return NextResponse.json(customer, { status: 201 })
})

// Hjelpefunksjoner
async function validateOrgNumber(orgNumber: string): Promise<boolean> {
  // Enkel validering - kan utvides med Brreg API
  const cleanedNumber = orgNumber.replace(/\s/g, '')
  return /^\d{9}$/.test(cleanedNumber)
}

async function sendWelcomeEmail(customer: any) {
  // Implementer email-sending med din email queue
  // await emailQueue.send({
  //   type: 'customer-welcome',
  //   to: customer.email,
  //   ...
  // })
}