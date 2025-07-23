import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    if (!file || !orderId) {
      return NextResponse.json(
        { error: 'Missing file or orderId' },
        { status: 400 }
      )
    }

    // Sjekk filstørrelse (maks 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Max 10MB allowed.' },
        { status: 413 }
      )
    }

    // For nå, lagre bare metadata i database
    // I produksjon ville du laste opp til Cloudinary, S3, etc.
    const image = await prisma.image.create({
      data: {
        orderId,
        filename: file.name,
        originalName: file.name,
        url: `/api/placeholder-image?name=${encodeURIComponent(file.name)}`,
        thumbnailUrl: `/api/placeholder-image?name=${encodeURIComponent(file.name)}&size=thumb`,
        size: file.size,
        mimeType: file.type,
        uploadedBy: 'current-user-id', // Hardkodet for nå
        status: 'UPLOADED'
      },
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
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    )
  }
}

// Konfigurer maks body size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}