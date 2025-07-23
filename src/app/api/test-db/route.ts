import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  console.log('Test DB route called')
  
  try {
    console.log('Creating Prisma Client...')
    const prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
    
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Connected!')
    
    // Test query
    const count = await prisma.company.count()
    console.log('Company count:', count)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      companyCount: count
    })
  } catch (error: any) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      stack: error.stack
    }, { status: 500 })
  }
}