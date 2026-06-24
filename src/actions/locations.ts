'use server'

import { prisma } from '@/lib/db'
import { LocationSchema, type LocationInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { siteName: 'asc' },
    include: {
      _count: { select: { employees: true, assets: true } },
    },
  })
}

export async function getLocation(id: number) {
  return prisma.location.findUnique({
    where: { id },
    include: {
      employees: true,
      assets: true,
    },
  })
}

export async function createLocation(data: LocationInput) {
  const validated = LocationSchema.parse(data)
  const location = await prisma.location.create({ data: validated })
  revalidatePath('/locations')
  return location
}

export async function updateLocation(id: number, data: LocationInput) {
  const validated = LocationSchema.parse(data)
  const location = await prisma.location.update({ where: { id }, data: validated })
  revalidatePath('/locations')
  revalidatePath(`/locations/${id}`)
  return location
}

export async function deleteLocation(id: number) {
  const location = await prisma.location.findUnique({
    where: { id },
    include: { _count: { select: { employees: true, assets: true } } }
  })

  if (!location) return { error: 'Location not found.' }

  if (location._count.employees > 0 || location._count.assets > 0) {
    return { error: `Cannot delete location "${location.siteName}" because it has employees or assets assigned to it.` }
  }

  await prisma.location.delete({ where: { id } })
  revalidatePath('/locations')
  return { success: true }
}

export async function deleteLocations(ids: number[]) {
  const locationsInUse = await prisma.location.findMany({
    where: { id: { in: ids } },
    include: { _count: { select: { employees: true, assets: true } } }
  })

  const inUseNames = locationsInUse
    .filter(l => l._count.employees > 0 || l._count.assets > 0)
    .map(l => l.siteName)

  if (inUseNames.length > 0) {
    return { error: `Cannot delete the following locations because they are in use: ${inUseNames.join(', ')}` }
  }

  await prisma.location.deleteMany({ where: { id: { in: ids } } })
  revalidatePath('/locations')
  return { success: true }
}

export async function importLocationsCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  const validData = []
  for (const row of parsedData) {
    if (!row.siteName) continue
    validData.push({
      siteName: row.siteName,
      address: row.address || null,
      city: row.city || null,
      country: row.country || null,
    })
  }

  if (validData.length === 0) return { error: 'No valid rows found.' }

  try {
    const result = await prisma.location.createMany({
      data: validData as any,
      skipDuplicates: true,
    })
    revalidatePath('/locations')
    return { success: true, count: result.count }
  } catch (err) {
    console.error(err)
    return { error: 'An error occurred during import.' }
  }
}
