'use server'

import { prisma } from '@/lib/db'
import { MaintenanceLogSchema, type MaintenanceLogInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getMaintenanceLogs(assetId?: string) {
  return prisma.maintenanceLog.findMany({
    where: assetId ? { assetId } : undefined,
    orderBy: { serviceDate: 'desc' },
    include: {
      asset: { include: { category: true } },
      vendor: true,
    },
  })
}

export async function getMaintenanceLog(id: number) {
  return prisma.maintenanceLog.findUnique({
    where: { id },
    include: {
      asset: { include: { category: true } },
      vendor: true,
    },
  })
}

export async function createMaintenanceLog(data: MaintenanceLogInput) {
  const validated = MaintenanceLogSchema.parse(data)
  const log = await prisma.maintenanceLog.create({
    data: {
      assetId: validated.assetId,
      serviceDate: new Date(validated.serviceDate),
      serviceType: validated.serviceType,
      vendorId: validated.vendorId || null,
      cost: validated.cost ?? null,
      description: validated.description || null,
      performedBy: validated.performedBy || null,
    },
  })
  revalidatePath('/maintenance')
  revalidatePath(`/assets/${validated.assetId}`)
  revalidatePath('/')
  return log
}

export async function deleteMaintenanceLog(id: number) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } })
  if (!log) return { error: 'Log not found.' }

  await prisma.maintenanceLog.delete({ where: { id } })
  revalidatePath('/maintenance')
  revalidatePath(`/assets/${log.assetId}`)
  revalidatePath('/')
  return { success: true }
}

export async function deleteMaintenanceLogs(ids: number[]) {
  const logs = await prisma.maintenanceLog.findMany({ where: { id: { in: ids } } })
  
  await prisma.maintenanceLog.deleteMany({ where: { id: { in: ids } } })
  
  revalidatePath('/maintenance')
  for (const log of logs) {
    revalidatePath(`/assets/${log.assetId}`)
  }
  revalidatePath('/')
  return { success: true }
}
