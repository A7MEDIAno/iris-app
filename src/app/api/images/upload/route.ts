import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Generer unikt filnavn
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${orderId}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
    const thumbnailFilename = `${orderId}/thumb-${timestamp}-${Math.random().toString(36).substring(7)}.jpg`

    // Konverter til buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generer thumbnail med sharp
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, { 
        fit: 'cover',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Get image metadata
    const metadata = await sharp(buffer).metadata()

    // Upload original til Supabase
    const { data: originalData, error: originalError } = await supabase
      .storage
      .from('images')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (originalError) throw originalError

    // Upload thumbnail
    const { data: thumbData, error: thumbError } = await supabase
      .storage
      .from('images')
      .upload(thumbnailFilename, thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (thumbError) throw thumbError

    // Hent public URLs
    const { data: { publicUrl: originalUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(filename)

    const { data: { publicUrl: thumbnailUrl } } = supabase
      .storage
      .from('images')
      .getPublicUrl(thumbnailFilename)

    // Lagre i database
    // For demo, bruker vi en hardkodet photographer ID
    const image = await prisma.image.create({
      data: {
        orderId,
        filename,
        originalName: file.name,
        url: originalUrl,
        thumbnailUrl,
        size: file.size,
        mimeType: file.type,
        width: metadata.width,
        height: metadata.height,
        uploadedBy: 'current-user-id', // Erstatt med faktisk bruker ID
        metadata: {
          format: metadata.format,
          density: metadata.density,
          hasAlpha: metadata.hasAlpha,
          orientation: metadata.orientation
        }
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