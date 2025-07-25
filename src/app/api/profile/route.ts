import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'

// GET /api/profile
export const GET = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      title: true,
      profileImage: true,
      bio: true,
      role: true,
      googleCalendarId: true,
      calendarSyncEnabled: true
    }
  })
  
  return NextResponse.json(user)
})

// PATCH /api/profile
export const PATCH = withErrorHandler(async (request: Request) => {
  const session = await requireAuth()
  const body = await request.json()
  
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: body.name,
      title: body.title,
      phone: body.phone,
      bio: body.bio
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      title: true,
      profileImage: true,
      bio: true,
      role: true,
      googleCalendarId: true,
      calendarSyncEnabled: true
    }
  })
  
  return NextResponse.json(updated)
})

export const dynamic = 'force-dynamic'