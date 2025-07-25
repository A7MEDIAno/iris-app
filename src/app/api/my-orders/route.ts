import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'

export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') || 'upcoming'
  
  // Bygg where-klausul basert på filter
  let where: any = {
    companyId: session.user.companyId,
    photographerId: session.user.id
  }
  
  if (filter === 'upcoming') {
    where.scheduledDate = { gte: new Date() }
    where.status = { notIn: ['COMPLETED', 'CANCELLED'] }
  } else if (filter === 'completed') {
    where.status = 'COMPLETED'
  }
  
  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: {
        select: {
          name: true,
          phone: true
        }
      }
    },
    orderBy: {
      scheduledDate: filter === 'upcoming' ? 'asc' : 'desc'
    }
  })
  
  return NextResponse.json({ orders })
})