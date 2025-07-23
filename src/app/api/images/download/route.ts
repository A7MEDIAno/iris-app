import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'
import archiver from 'archiver'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
  try {
    const { imageIds, orderId } = await request.json()

    // Hent bilder
    const images = await prisma.image.findMany({
      where: {
        id: { in: imageIds }
      }
    })

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images found' },
        { status: 404 }
      )
    }

    // Opprett ZIP i minnet
    const archive = archiver('zip', {
      zlib: { level: 9 } // Max kompresjon
    })

    const chunks: Buffer[] = []
    
    archive.on('data', (chunk) => {
      chunks.push(chunk)
    })

    // Last ned og legg til bilder i ZIP
    for (const image of images) {
      try {
        const response = await fetch(image.url)
        if (!response.ok) continue
        
        const buffer = await response.arrayBuffer()
        archive.append(Buffer.from(buffer), { 
          name: image.originalName 
        })
      } catch (error) {
        console.error(`Failed to download image ${image.id}:`, error)
      }
    }

    // Fullfør arkivet
    await archive.finalize()

    // Vent på at alle data er skrevet
    await new Promise((resolve) => {
      archive.on('end', resolve)
    })

    // Kombiner chunks til en buffer
    const zipBuffer = Buffer.concat(chunks)

    // Returner ZIP som response
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="order-${orderId}-images.zip"`
      }
    })

  } catch (error: any) {
    console.error('Error creating zip:', error)
    return NextResponse.json(
      { error: 'Failed to create zip', details: error.message },
      { status: 500 }
    )
  }
}