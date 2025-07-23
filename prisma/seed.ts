// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Opprett test company hvis den ikke finnes
  const company = await prisma.company.upsert({
    where: { subdomain: 'a7media' },
    update: {},
    create: {
      name: 'A7 MEDIA AS',
      orgNumber: '123456789',
      subdomain: 'a7media',
      subscriptionTier: 'PROFESSIONAL'
    }
  })
  console.log('✅ Created/found company:', company.name)

  // Opprett admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@a7media.no' },
    update: {},
    create: {
      email: 'admin@a7media.no',
      name: 'Mats Lønne',
      password: 'temp123', // Match det du har i POST
      role: 'ADMIN',
      companyId: company.id,
      phone: '+47 123 45 678'
    }
  })
  console.log('✅ Created/found admin user')

  // Opprett en fotograf
  const photographer = await prisma.user.upsert({
    where: { email: 'fotograf@a7media.no' },
    update: {},
    create: {
      email: 'fotograf@a7media.no',
      name: 'Andreas Hopperstad',
      password: 'temp123',
      role: 'PHOTOGRAPHER',
      companyId: company.id,
      phone: '+47 987 65 432'
    }
  })
  console.log('✅ Created/found photographer')

  // Opprett test customers
  const customer1 = await prisma.customer.upsert({
    where: { email: 'post@nordvik-hamar.no' },
    update: {},
    create: {
      name: 'Nordvik Hamar',
      email: 'post@nordvik-hamar.no',
      phone: '+47 62 52 40 00',
      companyId: company.id
    }
  })

  const customer2 = await prisma.customer.upsert({
    where: { email: 'post@aktiv.no' },
    update: {},
    create: {
      name: 'Aktiv Eiendomsmegling',
      email: 'post@aktiv.no',
      phone: '+47 23 23 23 23',
      companyId: company.id
    }
  })
  console.log('✅ Created customers')

  // Sjekk om det finnes ordre
  const existingOrders = await prisma.order.count({
    where: { companyId: company.id }
  })

  if (existingOrders === 0) {
    console.log('Creating test orders...')
    
    await prisma.order.create({
      data: {
        customerId: customer1.id,
        propertyAddress: 'Storgata 123, 2317 Hamar',
        propertyType: 'Enebolig',
        scheduledDate: new Date('2024-11-01T10:00:00'),
        status: 'PENDING',
        priority: 'NORMAL',
        companyId: company.id,
        createdById: admin.id
      }
    })

    await prisma.order.create({
      data: {
        customerId: customer2.id,
        propertyAddress: 'Parkveien 45, 2317 Hamar',
        propertyType: 'Leilighet',
        scheduledDate: new Date('2024-10-30T14:00:00'),
        status: 'ASSIGNED',
        priority: 'HIGH',
        photographerId: photographer.id,
        companyId: company.id,
        createdById: admin.id
      }
    })

    await prisma.order.create({
      data: {
        customerId: customer1.id,
        propertyAddress: 'Jernbaneveien 12, 2317 Hamar',
        propertyType: 'Rekkehus',
        scheduledDate: new Date('2024-10-25T09:00:00'),
        status: 'COMPLETED',
        priority: 'NORMAL',
        photographerId: photographer.id,
        companyId: company.id,
        createdById: admin.id
      }
    })
    
    console.log('✅ Created test orders')
  } else {
    console.log(`ℹ️ Found ${existingOrders} existing orders`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })