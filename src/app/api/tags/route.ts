import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(tags)

  } catch (error: any) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, icon } = body

    const tag = await prisma.tag.create({
      data: {
        name,
        category,
        icon
      }
    })

    return NextResponse.json(tag)

  } catch (error: any) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { error: 'Failed to create tag', details: error.message },
      { status: 500 }
    )
  }
}