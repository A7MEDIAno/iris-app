import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/db/prisma'
import { getCurrentCompany } from '../../../../lib/auth/session'

export async function POST(req: Request) {
  try {
    const { companyName, orgNumber, name, email, password } = await req.json()

    // Sjekk om firma eksisterer
    const existingCompany = await prisma.company.findUnique({
      where: { orgNumber }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Firma med dette org.nummeret finnes allerede' },
        { status: 400 }
      )
    }

    // Sjekk om email eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-post er allerede i bruk' },
        { status: 400 }
      )
    }

    // Hash passord
    const hashedPassword = await bcrypt.hash(password, 12)

    // Opprett firma og admin bruker
    const company = await prisma.company.create({
      data: {
        name: companyName,
        orgNumber,
        subdomain: companyName.toLowerCase().replace(/\s+/g, '-'),
        password: hashedPassword, // Midlertidig for enkel auth
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
            role: 'ADMIN'
          }
        }
      },
      include: {
        users: true
      }
    })

    // Sett session
    await setCompanySession(company.id)

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name
      }
    })
  } catch (error: any) {
    console.error('Register error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Data finnes allerede' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Kunne ikke opprette firma' },
      { status: 500 }
    )
  }
}