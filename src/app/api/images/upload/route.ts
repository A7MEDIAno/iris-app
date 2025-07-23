import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { prisma } from '../../../../lib/db/prisma'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler, ValidationError, AppError } from '@/lib/errors'
import sharp from 'sharp'

// Øk limit for Vercel
export const runtime = 'nodejs'
export const maxDuration = 60 // seconds

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await requireAuth()
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string

    // Validering
    if (!file || !orderId) {
      throw new ValidationError('File and orderId are required')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File too large. Max ${MAX_FILE_SIZE / 1024 / 1024}MB allowed.`)
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError('Invalid file type. Only JPEG, PNG, WebP and HEIC allowed.')
    }

    // Verifiser at ordre tilhører brukerens company
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        companyId: session.user.companyId
      }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    // Generer unike filnavn
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `orders/${orderId}/${timestamp}-${safeName}`
    const thumbnailFilename = `orders/${orderId}/thumb-${timestamp}-${safeName}`

    // Les fil til buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload original til Vercel Blob
    console.log('Uploading original to Vercel Blob...')
    const originalBlob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false
    })

    // Generer thumbnail med sharp
    let thumbnailBlob = null
    try {
      console.log('Generating thumbnail...')
      const thumbnailBuffer = await sharp(buffer)
        .resize(400, 400, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer()

      thumbnailBlob = await put(thumbnailFilename, thumbnailBuffer, {
        access: 'public',
        contentType: 'image/jpeg',
        addRandomSuffix: false
      })
    } catch (error) {
      console.error('Thumbnail generation failed:', error)
      // Fortsett uten thumbnail
    }

    // Hent metadata
    let metadata = {}
    try {
      const sharpMetadata = await sharp(buffer).metadata()
      metadata = {
        width: sharpMetadata.width,
        height: sharpMetadata.height,
        format: sharpMetadata.format,
        size: file.size
      }
    } catch (error) {
      console.error('Metadata extraction failed:', error)
    }

    // Lagre i database
    const image = await prisma.image.create({
      data: {
        orderId,
        filename: originalBlob.pathname,
        originalName: file.name,
        url: originalBlob.url,
        thumbnailUrl: thumbnailBlob?.url || originalBlob.url,
        size: file.size,
        mimeType: file.type,
        width: (metadata as any).width || null,
        height: (metadata as any).height || null,
        uploadedBy: session.user.id,
        status: 'UPLOADED',
        metadata: metadata
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    console.log('Image saved to database:', image.id)

    return NextResponse.json({
      success: true,
      image
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    
    // Spesifikk feilmelding for Vercel Blob
    if (error.message?.includes('BLOB_UNKNOWN')) {
      throw new AppError('Storage service unavailable. Please try again.', 503)
    }
    
    throw error
  }
})

// DELETE endpoint for å slette bilder
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const session = await requireAuth()
  const { searchParams } = new URL(request.url)
  const imageId = searchParams.get('id')

  if (!imageId) {
    throw new ValidationError('Image ID is required')
  }

  // Finn bildet og verifiser tilgang
  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      order: {
        companyId: session.user.companyId
      }
    }
  })

  if (!image) {
    throw new AppError('Image not found', 404)
  }

  // Slett fra Vercel Blob
  try {
    if (image.url) {
      await del(image.url)
    }
    if (image.thumbnailUrl && image.thumbnailUrl !== image.url) {
      await del(image.thumbnailUrl)
    }
  } catch (error) {
    console.error('Failed to delete from blob storage:', error)
    // Fortsett med database sletting selv om blob sletting feiler
  }

  // Slett fra database
  await prisma.image.delete({
    where: { id: imageId }
  })

  return NextResponse.json({
    success: true,
    message: 'Image deleted successfully'
  })
})