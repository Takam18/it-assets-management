'use server'

import { prisma } from '@/lib/db'
import { AreaSchema, type AreaInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getAreas() {
  return prisma.area.findMany({
    orderBy: [
      { location: 'asc' },
      { building: 'asc' },
      { room: 'asc' }
    ],
  })
}

export async function getArea(id: number) {
  return prisma.area.findUnique({
    where: { id },
  })
}

export async function createArea(data: AreaInput) {
  const validated = AreaSchema.parse(data)

  const area = await prisma.area.create({
    data: validated,
  })

  revalidatePath('/areas')
  return area
}

export async function updateArea(id: number, data: AreaInput) {
  const validated = AreaSchema.parse(data)

  const area = await prisma.area.update({
    where: { id },
    data: validated,
  })

  revalidatePath('/areas')
  return area
}

export async function deleteArea(id: number) {
  // If there were relations like assets in this area, we would check them here.
  // Currently the schema might not link Asset to Area directly, but if it does, add checks.
  await prisma.area.delete({
    where: { id },
  })

  revalidatePath('/areas')
  return { success: true }
}

export async function deleteAreas(ids: number[]) {
  await prisma.area.deleteMany({
    where: { id: { in: ids } }
  })
  revalidatePath('/areas')
  return { success: true }
}

export async function importAreasCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  const validData = []
  for (const row of parsedData) {
    if (!row.location || !row.building || !row.room) continue
    validData.push({
      location: row.location,
      building: row.building,
      room: row.room,
      remark: row.remark || null,
    })
  }

  if (validData.length === 0) return { error: 'No valid rows found (requires location, building, room).' }

  try {
    const result = await prisma.area.createMany({
      data: validData as any,
      skipDuplicates: true,
    })
    revalidatePath('/areas')
    return { success: true, count: result.count }
  } catch (err) {
    console.error(err)
    return { error: 'An error occurred during import.' }
  }
}
