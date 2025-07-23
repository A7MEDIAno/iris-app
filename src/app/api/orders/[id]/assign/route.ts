import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { photographerId } = await request.json()
    const orderId = params.id
    
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        photographerId,
        status: 'ASSIGNED'
      },
      include: {
        photographer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Fotograf tildelt',
      order
    })
  } catch (error: any) {
    console.error('Error assigning photographer:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Ordre ikke funnet' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Kunne ikke tildele fotograf' },
      { status: 500 }
    )
  }
}