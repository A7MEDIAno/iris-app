import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultTags = [
  // Interiør
  { name: 'Stue', category: 'interiør', icon: '🛋️' },
  { name: 'Kjøkken', category: 'interiør', icon: '🍳' },
  { name: 'Soverom', category: 'interiør', icon: '🛏️' },
  { name: 'Bad', category: 'interiør', icon: '🚿' },
  { name: 'Gang/Entre', category: 'interiør', icon: '🚪' },
  { name: 'Kontor', category: 'interiør', icon: '💼' },
  { name: 'Barnerom', category: 'interiør', icon: '🧸' },
  { name: 'Vaskerom', category: 'interiør', icon: '🧺' },
  { name: 'Bod', category: 'interiør', icon: '📦' },
  { name: 'Loft', category: 'interiør', icon: '🏠' },
  { name: 'Kjeller', category: 'interiør', icon: '🏚️' },
  
  // Eksteriør
  { name: 'Fasade', category: 'eksteriør', icon: '🏠' },
  { name: 'Hage', category: 'eksteriør', icon: '🌳' },
  { name: 'Terrasse', category: 'eksteriør', icon: '🪴' },
  { name: 'Balkong', category: 'eksteriør', icon: '🏗️' },
  { name: 'Garasje', category: 'eksteriør', icon: '🚗' },
  { name: 'Inngangsparti', category: 'eksteriør', icon: '🚪' },
  { name: 'Utsikt', category: 'eksteriør', icon: '🏔️' },
  { name: 'Drone', category: 'eksteriør', icon: '🚁' },
  
  // Detaljer
  { name: 'Detaljer', category: 'detaljer', icon: '🔍' },
  { name: 'Peis', category: 'detaljer', icon: '🔥' },
  { name: 'Vinduer', category: 'detaljer', icon: '🪟' },
  { name: 'Gulv', category: 'detaljer', icon: '🪵' },
  { name: 'Belysning', category: 'detaljer', icon: '💡' },
  
  // Spesielle
  { name: 'Plantegning', category: 'spesielle', icon: '📐' },
  { name: '360°', category: 'spesielle', icon: '🔄' },
  { name: 'Virtuell visning', category: 'spesielle', icon: '🥽' }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Opprett tags
  console.log('Creating tags...')
  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag
    })
  }
  console.log(`✅ Created ${defaultTags.length} tags`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })