// Denne filen gjør ALLE API routes dynamiske
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // eller 'edge' hvis du vil bruke Edge Runtime

// Tom handler siden dette bare er config
export async function GET() {
  return new Response('API root', { status: 200 })
}