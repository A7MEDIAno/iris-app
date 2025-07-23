import { NextResponse } from 'next/server'

// Custom error klasser
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

// API error handler
export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  // Håndter våre custom errors
  if (error instanceof AppError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        details: error.details 
      },
      { status: error.statusCode }
    )
  }
  
  // Håndter Prisma errors
  if (error instanceof Error) {
    if (error.message.includes('P2002')) {
      return NextResponse.json(
        { error: 'Resource already exists', code: 'DUPLICATE' },
        { status: 409 }
      )
    }
    
    if (error.message.includes('P2025')) {
      return NextResponse.json(
        { error: 'Resource not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
  }
  
  // Default error
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

// Wrap async route handlers
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}