import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('Connected to database!')
    
    // Try to count companies
    const count = await prisma.company.count()
    console.log('Company count:', count)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      companyCount: count,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      details: error.toString()
    }, { status: 500 })
  }
}