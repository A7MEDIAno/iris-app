import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths som krever autentisering
const protectedPaths = [
  '/dashboard',
  '/orders',
  '/customers',
  '/photographers',
  '/products',
  '/settings',
  '/analytics',
  '/invoices'
]

// API routes som ikke krever auth
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/placeholder-image'
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Sjekk om dette er en beskyttet path
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  const isProtectedApi = path.startsWith('/api/') && 
    !publicApiRoutes.some(r => path.startsWith(r))

  if (isProtectedPath || isProtectedApi) {
    const token = request.cookies.get('auth-token')
    
    if (!token) {
      // For API routes, returner 401
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      // For pages, redirect til login
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}