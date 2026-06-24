'use server'

import { prisma } from '@/lib/db'
import { AssetCategorySchema, type AssetCategoryInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  return prisma.assetCategory.findMany({
    orderBy: [
      { parentId: 'asc' },
      { categoryName: 'asc' }
    ],
    include: {
      parent: true,
      _count: { select: { assets: true } },
    },
  })
}

export async function getCategory(id: number) {
  return prisma.assetCategory.findUnique({
    where: { id },
    include: { assets: true, parent: true },
  })
}

export async function createCategory(data: AssetCategoryInput) {
  const validated = AssetCategorySchema.parse(data)
  const category = await prisma.assetCategory.create({ data: validated })
  revalidatePath('/', 'layout')
  return category
}

export async function updateCategory(id: number, data: AssetCategoryInput) {
  const validated = AssetCategorySchema.parse(data)
  const category = await prisma.assetCategory.update({ where: { id }, data: validated })
  revalidatePath('/categories')
  revalidatePath('/', 'layout')
  return category
}

export async function updateCategoryPrice(id: number, defaultPrice: number | null) {
  try {
    const category = await prisma.assetCategory.update({
      where: { id },
      data: { defaultPrice }
    })
    revalidatePath('/settings/pricing')
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { error: 'Failed to update category price.' }
  }
}

export async function deleteCategory(id: number) {
  const category = await prisma.assetCategory.findUnique({
    where: { id },
    include: { _count: { select: { assets: true, subCategories: true } } }
  })

  if (!category) {
    return { error: 'Category not found.' }
  }

  if (category._count.assets > 0 || category._count.subCategories > 0) {
    return { error: `Cannot delete "${category.categoryName}" because it contains assets or sub-categories. Please reassign them first.` }
  }

  await prisma.assetCategory.delete({ where: { id } })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteCategories(ids: number[]) {
  const categoriesInUse = await prisma.assetCategory.findMany({
    where: { id: { in: ids } },
    include: {
      _count: { select: { assets: true, subCategories: true } }
    }
  })
  
  const inUseNames = categoriesInUse
    .filter(c => c._count.assets > 0 || c._count.subCategories > 0)
    .map(c => c.categoryName)
    
  if (inUseNames.length > 0) {
    return { error: `Cannot delete the following categories because they contain assets or sub-categories: ${inUseNames.join(', ')}. Please reassign them first.` }
  }

  await prisma.assetCategory.deleteMany({ where: { id: { in: ids } } })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function importCategoriesCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  const validData = []
  for (const row of parsedData) {
    if (!row.categoryName) continue
    validData.push({
      categoryName: row.categoryName,
      description: row.description || null,
      parentId: row.parentId || null,
      defaultPrice: row.defaultPrice ? parseFloat(row.defaultPrice) : null,
    })
  }

  if (validData.length === 0) return { error: 'No valid rows found.' }

  try {
    const result = await prisma.assetCategory.createMany({
      data: validData as any,
      skipDuplicates: true,
    })
    revalidatePath('/', 'layout')
    return { success: true, count: result.count }
  } catch (err) {
    console.error(err)
    return { error: 'An error occurred during import.' }
  }
}
