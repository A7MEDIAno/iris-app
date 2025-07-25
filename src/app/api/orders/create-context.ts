import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

export async function createOrderContext(request: Request) {
  const session = await requireAuth()
  const [company, user] = await Promise.all([
    prisma.company.findUnique({ where: { id: session.user.companyId } }),
    prisma.user.findUnique({ where: { id: session.user.id } })
  ])
  if (!company || !user) {
    throw new Error('Invalid session')
  }
  return { company, user, session }
}