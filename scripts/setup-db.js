const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')
  
  try {
    // 1. Opprett firma
    const company = await prisma.company.create({
      data: {
        name: 'A7 MEDIA',
        orgNumber: '123456789',
        subdomain: 'a7media',
        subscriptionTier: 'STANDARD'
      }
    })
    console.log('✅ Company created:', company.name)
    
    // 2. Opprett admin bruker
    const hashedPassword = await bcrypt.hash('password123', 12)
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@a7media.no',
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id
      }
    })
    console.log('✅ Admin user created:', adminUser.email)
    
    // 3. Opprett noen test-produkter
    const products = await prisma.product.createMany({
      data: [
        {
          name: 'Standard boligfoto',
          description: '15-25 profesjonelle bilder',
          priceExVat: 3500,
          pke: 500,
          pki: 200,
          photographerFee: 1200,
          companyId: company.id
        },
        {
          name: 'Plantegning',
          description: '2D plantegning via CubiCasa',
          priceExVat: 800,
          pke: 600,
          pki: 50,
          photographerFee: 100,
          companyId: company.id
        },
        {
          name: 'Dronevideo',
          description: '2-3 minutters video',
          priceExVat: 2500,
          pke: 0,
          pki: 300,
          photographerFee: 1000,
          companyId: company.id
        }
      ]
    })
    console.log('✅ Products created:', products.count)
    
    console.log('\n🎉 Database setup complete!')
    console.log('You can now log in with:')
    console.log('Email: admin@a7media.no')
    console.log('Password: password123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()