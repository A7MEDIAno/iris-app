import { NextResponse } from 'next/server'

export async function GET() {
  const env = {
    hasDatabase: !!process.env.DATABASE_URL,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    // Vis første del av URL-er for debugging (ikke hele for sikkerhet)
    databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30) + '...',
    supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
  }

  return NextResponse.json({
    message: 'Debug info',
    environment: env,
    timestamp: new Date().toISOString()
  })
}