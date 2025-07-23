const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Slett eksisterende data først (valgfritt)
  await prisma.order.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()
  console.log('🧹 Cleaned existing data')

  // Opprett test company
  const company = await prisma.company.create({
    data: {
      name: 'A7 MEDIA AS',
      orgNumber: '123456789',
      subdomain: 'a7media',
      subscriptionTier: 'PROFESSIONAL'
    }
  })
  console.log('✅ Created company')

  // Opprett admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@a7media.no',
      name: 'Mats Lønne',
      password: 'temp123',
      role: 'ADMIN',
      companyId: company.id,
      phone: '+47 123 45 678'
    }
  })
  console.log('✅ Created admin user')

  // Opprett fotograf
  const photographer = await prisma.user.create({
    data: {
      email: 'fotograf@a7media.no',
      name: 'Andreas Hopperstad',
      password: 'temp123',
      role: 'PHOTOGRAPHER',
      companyId: company.id,
      phone: '+47 987 65 432'
    }
  })
  console.log('✅ Created photographer')

  // Opprett customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Nordvik Hamar',
      email: 'post@nordvik-hamar.no',
      phone: '+47 62 52 40 00',
      companyId: company.id
    }
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Aktiv Eiendomsmegling',
      email: 'post@aktiv.no',
      phone: '+47 23 23 23 23',
      companyId: company.id
    }
  })
  console.log('✅ Created customers')

  // Opprett test ordre
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