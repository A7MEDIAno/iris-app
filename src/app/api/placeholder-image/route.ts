import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || 'image'
  const size = searchParams.get('size') || 'full'
  
  const width = size === 'thumb' ? 400 : 1200
  const height = size === 'thumb' ? 300 : 900
  
  // Generer SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a2e"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size === 'thumb' ? 14 : 24}" fill="#666" text-anchor="middle" dy=".3em">
        ${name}
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
