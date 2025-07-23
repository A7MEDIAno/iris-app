import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { withErrorHandler, ValidationError } from '@/lib/errors'

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    throw new ValidationError('Email and password are required')
  }

  const user = await login(email, password)
  
  return NextResponse.json({
    user,
    success: true
  })
})