// Sentralisert miljøvariabel håndtering med validering

type EnvConfig = {
  DATABASE_URL: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  NODE_ENV: 'development' | 'production' | 'test'
  NEXT_PUBLIC_APP_URL: string
  RESEND_API_KEY: string
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback
  
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  
  return value
}

// Eksporter validerte miljøvariabler
export const env: EnvConfig = {
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET', 'dev-secret-CHANGE-IN-PRODUCTION'),
  NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL', 'http://localhost:3000'),
  NODE_ENV: (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'],
  NEXT_PUBLIC_APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY')
}

// Valider ved oppstart
if (env.NODE_ENV === 'production' && env.NEXTAUTH_SECRET === 'dev-secret-CHANGE-IN-PRODUCTION') {
  throw new Error('NEXTAUTH_SECRET must be changed in production!')
}