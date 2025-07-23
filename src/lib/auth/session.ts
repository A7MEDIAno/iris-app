import { cookies } from 'next/headers'
import { prisma } from '../db/prisma'

export async function getCurrentCompany() {
  try {
    // For nå, returner første company
    // Senere implementerer vi ordentlig session
    const company = await prisma.company.findFirst()
    return company
  } catch (error) {
    console.error('Error getting company:', error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    // Midlertidig - returner første admin
    const user = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function setCompanySession(companyId: string) {
  const cookieStore = cookies()
  cookieStore.set('company-id', companyId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 dager
  })
}