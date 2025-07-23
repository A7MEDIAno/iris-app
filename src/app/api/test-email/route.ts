import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { withErrorHandler } from '@/lib/errors'
import { emailService } from '@/lib/email'

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await requireAuth()
  
  // Kun for admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { type, email } = await request.json()
  
  // Send test email
  try {
    switch (type) {
      case 'order-confirmation':
        await emailService.send({
          type: 'order-confirmation',
          to: email || session.user.email,
          subject: 'Test: Ordrebekreftelse',
          customerName: 'Test Kunde',
          orderNumber: 12345,
          propertyAddress: 'Testveien 123, 0123 Oslo',
          scheduledDate: new Date(),
          photographerName: 'Test Fotograf'
        })
        break
        
      case 'order-completed':
        await emailService.send({
          type: 'order-completed',
          to: email || session.user.email,
          subject: 'Test: Bildene er klare',
          customerName: 'Test Kunde',
          orderNumber: 12345,
          propertyAddress: 'Testveien 123, 0123 Oslo',
          downloadUrl: 'https://example.com/download',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        break
        
      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${email || session.user.email}` 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to send test email', 
      details: error.message 
    }, { status: 500 })
  }
})