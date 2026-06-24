'use server'

import { prisma } from '@/lib/db'
import { AssetSchema, type AssetInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { AssetStatus } from '@/lib/types'

export async function getAssets(search?: string, status?: string) {
  return prisma.asset.findMany({
    where: {
      AND: [
        status && status !== 'all'
          ? { status: status as AssetStatus }
          : {},
        search
          ? {
            OR: [
              { serialNumber: { contains: search, mode: 'insensitive' } },
              { computerName: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
            ],
          }
          : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      brand: true,
      vendor: true,
      location: true,
      area: true,
    },
  })
}

export async function getAsset(id: string) {
  return prisma.asset.findUnique({
    where: { computerName: id },
    include: {
      category: true,
      brand: true,
      vendor: true,
      location: true,
      area: true,
      assignments: {
        include: { employee: true },
        orderBy: { assignedDate: 'desc' },
      },
      maintenanceLogs: {
        include: { vendor: true },
        orderBy: { serviceDate: 'desc' },
      },
    },
  })
}

export async function createAsset(data: AssetInput) {
  const validated = AssetSchema.parse(data)
  const asset = await prisma.asset.create({
    data: {
      computerName: validated.computerName,
      serialNumber: validated.serialNumber || null,
      categoryId: validated.categoryId || null,
      vendorId: validated.vendorId || null,
      model: validated.model || null,
      assetNumber: validated.assetNumber || null,
      purchaseOrderNo: validated.purchaseOrderNo || null,
      purchaseDate: validated.purchaseDate ? new Date(validated.purchaseDate) : null,
      purchaseCost: validated.purchaseCost ?? null,
      warrantyStart: validated.warrantyStart ? new Date(validated.warrantyStart) : null,
      warrantyExpiration: validated.warrantyExpiration ? new Date(validated.warrantyExpiration) : null,
      status: validated.status,
      locationId: validated.locationId || null,
      notes: validated.notes || null,
      operatingSystem: validated.operatingSystem || null,
      ipAddress: validated.ipAddress || null,
      macAddress: validated.macAddress || null,
      isAssetLabeled: validated.isAssetLabeled ?? false,
    },
  })
  revalidatePath('/assets')
  revalidatePath('/')
  return asset
}

export async function updateAsset(id: string, data: AssetInput) {
  const validated = AssetSchema.parse(data)
  const asset = await prisma.asset.update({
    where: { computerName: id },
    data: {
      computerName: validated.computerName,
      serialNumber: validated.serialNumber || null,
      categoryId: validated.categoryId || null,
      vendorId: validated.vendorId || null,
      model: validated.model || null,
      assetNumber: validated.assetNumber || null,
      purchaseOrderNo: validated.purchaseOrderNo || null,
      purchaseDate: validated.purchaseDate ? new Date(validated.purchaseDate) : null,
      purchaseCost: validated.purchaseCost ?? null,
      warrantyStart: validated.warrantyStart ? new Date(validated.warrantyStart) : null,
      warrantyExpiration: validated.warrantyExpiration ? new Date(validated.warrantyExpiration) : null,
      status: validated.status,
      locationId: validated.locationId || null,
      notes: validated.notes || null,
      operatingSystem: validated.operatingSystem || null,
      ipAddress: validated.ipAddress || null,
      macAddress: validated.macAddress || null,
      isAssetLabeled: validated.isAssetLabeled ?? false,
    },
  })
  revalidatePath('/assets')
  revalidatePath(`/assets/${id}`)
  revalidatePath('/')
  return asset
}

export async function deleteAsset(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { computerName: id },
    include: { _count: { select: { assignments: true, maintenanceLogs: true } } }
  })

  if (!asset) return { error: 'Asset not found.' }

  if (asset._count.assignments > 0 || asset._count.maintenanceLogs > 0) {
    return { error: `Cannot delete asset "${asset.computerName}" because it has active assignments or maintenance logs.` }
  }

  await prisma.asset.delete({ where: { computerName: id } })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteAssets(ids: string[]) {
  const assetsInUse = await prisma.asset.findMany({
    where: { computerName: { in: ids } },
    include: { _count: { select: { assignments: true, maintenanceLogs: true } } }
  })

  const inUseNames = assetsInUse
    .filter(a => a._count.assignments > 0 || a._count.maintenanceLogs > 0)
    .map(a => a.computerName)

  if (inUseNames.length > 0) {
    return { error: `Cannot delete the following assets because they have assignments or maintenance logs: ${inUseNames.join(', ')}` }
  }

  await prisma.asset.deleteMany({ where: { computerName: { in: ids } } })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function importAssetsCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  // Basic validation and mapping
  const validAssets = []
  for (const row of parsedData) {
    if (!row.computerName) continue // skip invalid rows
    
    // We only import what's in the CSV, mapping what we can. 
    // Usually categoryId, vendorId are hard to import without IDs, but we'll import simple fields.
    validAssets.push({
      computerName: row.computerName,
      serialNumber: row.serialNumber || null,
      model: row.model || null,
      assetNumber: row.assetNumber || null,
      purchaseOrderNo: row.purchaseOrderNo || null,
      status: row.status || 'In Stock',
      notes: row.notes || null,
      operatingSystem: row.operatingSystem || null,
      ipAddress: row.ipAddress || null,
      macAddress: row.macAddress || null,
      // Date and number parsing is omitted for simplicity or could be added if needed
    })
  }

  if (validAssets.length === 0) return { error: 'No valid assets found in CSV. Missing computerName?' }

  try {
    const result = await prisma.asset.createMany({
      data: validAssets as any,
      skipDuplicates: true,
    })
    revalidatePath('/', 'layout')
    return { success: true, count: result.count }
  } catch (err) {
    console.error(err)
    return { error: 'An error occurred during import.' }
  }
}

export async function toggleAssetLabel(id: string, isAssetLabeled: boolean) {
  const asset = await prisma.asset.update({
    where: { computerName: id },
    data: { isAssetLabeled },
  })
  revalidatePath('/', 'layout')
  return asset
}

export async function getAssetStats() {
  const [total, inStock, assigned, inRepair, retired, lostStolen] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: 'In Stock' } }),
    prisma.asset.count({ where: { status: 'Assigned' } }),
    prisma.asset.count({ where: { status: 'InRepair' } }),
    prisma.asset.count({ where: { status: 'Retired' } }),
    prisma.asset.count({ where: { status: 'LostStolen' } }),
  ])

  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

  const agingAssetsCount = await prisma.asset.count({
    where: {
      warrantyStart: { lt: threeYearsAgo },
      status: { notIn: ['Retired', 'LostStolen'] },
    },
  })

  const categoryBreakdown = await prisma.assetCategory.findMany({
    include: { _count: { select: { assets: true } } },
    orderBy: { categoryName: 'asc' },
  })

  const warrantyExpiringSoon = await prisma.asset.findMany({
    where: {
      warrantyExpiration: {
        gte: new Date(),
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      status: { not: 'Retired' },
    },
    include: { category: true, vendor: true },
    orderBy: { warrantyExpiration: 'asc' },
  })

  const recentAssignments = await prisma.assetAssignment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      asset: { include: { category: true } },
      employee: true,
    },
  })

  const recentMaintenance = await prisma.maintenanceLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      asset: true,
      vendor: true,
    },
  })

  const totalCost = await prisma.asset.aggregate({
    _sum: { purchaseCost: true },
  })

  return {
    total,
    inStock,
    assigned,
    inRepair,
    retired,
    lostStolen,
    agingAssetsCount,
    categoryBreakdown,
    warrantyExpiringSoon,
    recentAssignments,
    recentMaintenance,
    totalCost: totalCost._sum.purchaseCost,
  }
}
