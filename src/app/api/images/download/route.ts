import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError, AppError } from '@/lib/errors'
import archiver from 'archiver'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await requireAuth()
  const { imageIds, orderId } = await request.json()

  if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
    throw new ValidationError('No images selected for download')
  }

  // Verifiser tilgang til ordre
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      companyId: session.user.companyId
    },
    include: {
      customer: true
    }
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  // Hent bilder
  const images = await prisma.image.findMany({
    where: {
      id: { in: imageIds },
      orderId: orderId
    }
  })

  if (images.length === 0) {
    throw new AppError('No images found', 404)
  }

  // Opprett ZIP i minnet
  const archive = archiver('zip', {
    zlib: { level: 9 }
  })

  const chunks: Buffer[] = []
  
  archive.on('data', (chunk) => {
    chunks.push(chunk)
  })

  archive.on('error', (err) => {
    console.error('Archive error:', err)
    throw new AppError('Failed to create archive', 500)
  })

  // Last ned og legg til bilder
  const folder = `${order.customer.name}_${order.propertyAddress}`.replace(/[^a-zA-Z0-9]/g, '_')
  
  for (const image of images) {
    try {
      console.log(`Fetching image: ${image.originalName}`)
      const response = await fetch(image.url)
      
      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.statusText}`)
        continue
      }
      
      const buffer = await response.arrayBuffer()
      archive.append(Buffer.from(buffer), { 
        name: `${folder}/${image.originalName}`
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

  // Kombiner chunks
  const zipBuffer = Buffer.concat(chunks)

  // Returner ZIP
  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${folder}_bilder.zip"`,
      'Content-Length': zipBuffer.length.toString()
    }
  })
})