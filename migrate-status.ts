import { prisma } from './src/lib/db'

async function main() {
  const result = await prisma.asset.updateMany({
    where: { status: 'Available' },
    data: { status: 'In Stock' }
  })
  console.log(`Successfully migrated ${result.count} assets from 'Available' to 'In Stock'.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
