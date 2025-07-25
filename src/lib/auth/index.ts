import { headers } from 'next/headers'
import { prisma } from '@/lib/db/prisma'

export interface AuthSession {
  user: {
    id: string
    role: string
    companyId: string
  }
}

// Hent session fra middleware headers
export async function getSession(): Promise<AuthSession | null> {
  const headersList = headers()
  
  const userId = headersList.get('x-user-id')
  const role = headersList.get('x-user-role')
  const companyId = headersList.get('x-user-company-id')
  
  if (!userId || !role || !companyId) {
    return null
  }
  
  return {
    user: {
      id: userId,
      role: role,
      companyId: companyId
    }
  }
}

// For API routes - kaster error hvis ikke autentisert
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

// Hent full brukerinfo når nødvendig
export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImage: true,
      title: true,
      company: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
  
  return user
}

// Hent brukerens company
export async function getCurrentCompany() {
  const session = await getSession()
  if (!session) return null

  return prisma.company.findUnique({
    where: { id: session.user.companyId }
  })
}