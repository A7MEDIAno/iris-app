import { prisma } from '../db/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../config/env'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: string
  companyId: string
}

export type Session = {
  user: SessionUser
  expires: string
}

// Opprett JWT token
function createToken(user: SessionUser): string {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    },
    env.NEXTAUTH_SECRET,
    { expiresIn: '7d' }
  )
}

// Verifiser JWT token
function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, env.NEXTAUTH_SECRET) as SessionUser
    return decoded
  } catch {
    return null
  }
}

// Login funksjon
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true }
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    throw new Error('Invalid credentials')
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId
  }

  const token = createToken(sessionUser)
  
  // Sett cookie
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dager
    path: '/'
  })

  return sessionUser
}

// Logout funksjon
export async function logout() {
  cookies().delete('auth-token')
}

// Hent current session
export async function getSession(): Promise<Session | null> {
  try {
    const token = cookies().get('auth-token')?.value
    if (!token) return null

    const user = verifyToken(token)
    if (!user) return null

    return {
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch {
    return null
  }
}

// Krev autentisering
export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

// Hent brukerens company
export async function getCurrentCompany() {
  const session = await getSession()
  if (!session) return null

  return prisma.company.findUnique({
    where: { id: session.user.companyId }
  })
}

// Hent current user
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  return prisma.user.findUnique({
    where: { id: session.user.id }
  })
}