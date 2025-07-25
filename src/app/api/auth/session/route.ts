import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'
import { prisma } from '@/lib/db/prisma'

export const GET = withErrorHandler(async () => {
  const session = await requireAuth()
  
  // Hent full brukerinfo
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profileImage: true
    }
  })
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    user
  })
})