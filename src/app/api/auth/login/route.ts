import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { withErrorHandler, ValidationError } from '@/lib/errors'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    throw new ValidationError('E-post og passord er påkrevd')
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: true
    }
  })

  if (!user || !await bcrypt.compare(password, user.password)) {
    throw new ValidationError('Ugyldig e-post eller passord')
  }

  // Opprett JWT med jose
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const token = await new jose.SignJWT({
    userId: user.id,
    role: user.role,
    companyId: user.companyId
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)

  // Sett cookie
  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company
    }
  })

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dager
    path: '/'  // ← Legg til denne for å være sikker
  })

  return response
})