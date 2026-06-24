'use server'

import { prisma } from '@/lib/db'
import { VendorSchema, type VendorInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getVendors() {
  return prisma.vendor.findMany({
    orderBy: { vendorName: 'asc' },
    include: {
      _count: { select: { assets: true, maintenanceLogs: true } },
    },
  })
}

export async function getVendor(id: number) {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      assets: { include: { category: true } },
      maintenanceLogs: { include: { asset: true }, orderBy: { serviceDate: 'desc' } },
    },
  })
}

export async function createVendor(data: VendorInput) {
  const validated = VendorSchema.parse(data)
  const vendor = await prisma.vendor.create({ data: validated })
  revalidatePath('/', 'layout')
  return vendor
}

export async function updateVendor(id: number, data: VendorInput) {
  const validated = VendorSchema.parse(data)
  const vendor = await prisma.vendor.update({ where: { id }, data: validated })
  revalidatePath('/', 'layout')
  return vendor
}

export async function deleteVendor(id: number) {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: { _count: { select: { assets: true, maintenanceLogs: true } } }
  })

  if (!vendor) return { error: 'Vendor not found.' }

  if (vendor._count.assets > 0 || vendor._count.maintenanceLogs > 0) {
    return { error: `Cannot delete vendor "${vendor.vendorName}" because they have related assets or maintenance logs.` }
  }

  await prisma.vendor.delete({ where: { id } })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteVendors(ids: number[]) {
  const vendorsInUse = await prisma.vendor.findMany({
    where: { id: { in: ids } },
    include: { _count: { select: { assets: true, maintenanceLogs: true } } }
  })

  const inUseNames = vendorsInUse
    .filter(v => v._count.assets > 0 || v._count.maintenanceLogs > 0)
    .map(v => v.vendorName)

  if (inUseNames.length > 0) {
    return { error: `Cannot delete the following vendors because they have related assets or maintenance logs: ${inUseNames.join(', ')}` }
  }

  await prisma.vendor.deleteMany({ where: { id: { in: ids } } })
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function importVendorsCsv(parsedData: any[]) {
  if (!parsedData || parsedData.length === 0) return { error: 'No data to import.' }
  
  const validData = []
  for (const row of parsedData) {
    if (!row.vendorName) continue
    validData.push({
      vendorName: row.vendorName,
      contactPerson: row.contactPerson || null,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
    })
  }

  if (validData.length === 0) return { error: 'No valid rows found.' }

  try {
    const result = await prisma.vendor.createMany({
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
