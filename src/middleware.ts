import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Offentlige routes som ikke trenger auth
  const publicPaths = [
    '/login', 
    '/register', 
    '/api/auth/login', 
    '/api/auth/register',
    '/api/debug',
    '/api/test-db'
  ]
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Sjekk auth for beskyttede routes
  const token = request.cookies.get('auth-token')
  
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jose.jwtVerify(token.value, secret)
    
    // Legg til brukerinfo i headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId as string)
    requestHeaders.set('x-user-role', payload.role as string)
    requestHeaders.set('x-user-company-id', payload.companyId as string)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    })
  } catch (error) {
    console.error('JWT verification failed:', error)
    
    // Slett ugyldig token
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url))
    
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}