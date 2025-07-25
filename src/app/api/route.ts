// Denne filen gjør ALLE API routes dynamiske
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Dummy route handler
export async function GET() {
  return Response.json({ 
    name: 'IRIS API',
    version: '1.0.0',
    status: 'operational' 
  })
}