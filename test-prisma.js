const { PrismaClient } = require('@prisma/client')

console.log('Testing Prisma Client...')

try {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
  
  console.log('Prisma Client created successfully!')
  
  // Test connection
  prisma.$connect()
    .then(() => {
      console.log('Connected to database!')
      return prisma.$disconnect()
    })
    .then(() => {
      console.log('Disconnected from database!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Connection failed:', error)
      process.exit(1)
    })
} catch (error) {
  console.error('Failed to create Prisma Client:', error)
  process.exit(1)
}