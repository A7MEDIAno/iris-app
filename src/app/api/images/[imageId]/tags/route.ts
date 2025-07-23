import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { tagIds } = await request.json()

    // Fjern eksisterende tags
    await prisma.imageTag.deleteMany({
      where: { imageId: params.imageId }
    })

    // Legg til nye tags
    if (tagIds.length > 0) {
      await prisma.imageTag.createMany({
        data: tagIds.map((tagId: string) => ({
          imageId: params.imageId,
          tagId
        }))
      })
    }

    // Hent oppdatert bilde med tags
    const image = await prisma.image.findUnique({
      where: { id: params.imageId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(image)

  } catch (error: any) {
    console.error('Tag update error:', error)
    return NextResponse.json(
      { error: 'Failed to update tags', details: error.message },
      { status: 500 }
    )
  }
}