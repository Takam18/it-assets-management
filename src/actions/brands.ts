'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getBrands() {
  return prisma.brand.findMany({
    orderBy: { brandName: 'asc' },
  })
}

export async function getBrandById(id: number) {
  return prisma.brand.findUnique({
    where: { id }
  })
}

export async function createBrand(formData: FormData) {
  const brandName = formData.get('brandName') as string

  if (!brandName) {
    throw new Error('Invalid input')
  }

  const brand = await prisma.brand.create({
    data: {
      brandName,
    },
  })

  revalidatePath('/brands')
  revalidatePath('/', 'layout')
  return brand
}

export async function updateBrand(id: number, formData: FormData) {
  const brandName = formData.get('brandName') as string

  if (!brandName) {
    throw new Error('Invalid input')
  }

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      brandName,
    },
  })

  revalidatePath('/brands')
  revalidatePath('/', 'layout')
  return brand
}

export async function deleteBrand(id: number) {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { assets: true } } }
  })

  if (!brand) return { error: 'Brand not found.' }

  if (brand._count.assets > 0) {
    return { error: `Cannot delete brand "${brand.brandName}" because it is associated with assets.` }
  }

  await prisma.brand.delete({
    where: { id },
  })

  revalidatePath('/brands')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteBrands(ids: number[]) {
  const brandsInUse = await prisma.brand.findMany({
    where: { id: { in: ids } },
    include: { _count: { select: { assets: true } } }
  })

  const inUseNames = brandsInUse
    .filter(b => b._count.assets > 0)
    .map(b => b.brandName)

  if (inUseNames.length > 0) {
    return { error: `Cannot delete the following brands because they are associated with assets: ${inUseNames.join(', ')}` }
  }

  await prisma.brand.deleteMany({ where: { id: { in: ids } } })
  revalidatePath('/brands')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function importBrandsCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  const validData = []
  for (const row of parsedData) {
    if (!row.brandName) continue
    validData.push({
      brandName: row.brandName,
    })
  }

  if (validData.length === 0) return { error: 'No valid rows found.' }

  try {
    const result = await prisma.brand.createMany({
      data: validData as any,
      skipDuplicates: true,
    })
    revalidatePath('/brands')
    revalidatePath('/', 'layout')
    return { success: true, count: result.count }
  } catch (err) {
    console.error(err)
    return { error: 'An error occurred during import.' }
  }
}
