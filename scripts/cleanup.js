const fs = require('fs')
const path = require('path')

console.log('🧹 Starting cleanup...')

const filesToDelete = [
  'test-prisma.js',
  '{',
  'prisma/seed.ts',
  'src/app/(auth)/src',
  'src/app/api/customers/src'
]

let deletedCount = 0

filesToDelete.forEach(file => {
  const fullPath = path.join(__dirname, '..', file)
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true })
      } else {
        fs.unlinkSync(fullPath)
      }
      console.log(`✅ Deleted: ${file}`)
      deletedCount++
    } else {
      console.log(`⏭️  Skipped (not found): ${file}`)
    }
  } catch (error) {
    console.error(`❌ Error deleting ${file}:`, error.message)
  }
})

console.log(`\n✨ Cleanup complete! Deleted ${deletedCount} files/folders.`)