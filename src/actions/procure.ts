'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getProcurementForecast() {
  try {
    const assets = await prisma.asset.findMany({
      where: { orderInProgress: true },
      include: {
        category: true,
        vendor: true
      }
    })

    let budgets: any[] = []
    try {
      budgets = await prisma.fYBudget.findMany()
    } catch (e) {
      console.warn("Could not load FYBudgets, schema cache might be stale.", e)
    }

    return { success: true, assets, budgets }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to load procurement forecast.' }
  }
}

export async function createPurchaseOrder(data: FormData) {
  try {
    const poNumber = data.get('poNumber') as string
    const vendorId = parseInt(data.get('vendorId') as string)
    const type = data.get('type') as string
    const totalAmount = parseFloat(data.get('totalAmount') as string)
    
    await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        type,
        totalAmount,
        remainingAmount: type === 'BLANKET' ? totalAmount : null,
      }
    })
    revalidatePath('/procure')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create PO. PO Number might not be unique or schema cache is stale.' }
  }
}

export async function getPurchaseOrders() {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      include: {
        vendor: true,
        schedules: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, pos }
  } catch (error: any) {
    console.error(error)
    if (error.message?.includes('PurchaseOrder')) {
       return { success: true, pos: [], note: 'Database schema changed. Please restart npm run dev.' }
    }
    return { error: 'Failed to load POs.' }
  }
}

export async function createPurchaseSchedule(data: FormData) {
  try {
    const purchaseOrderId = parseInt(data.get('purchaseOrderId') as string)
    const assetCategoryId = parseInt(data.get('assetCategoryId') as string)
    const quantity = parseInt(data.get('quantity') as string)
    const expectedDeliveryStr = data.get('expectedDelivery') as string
    const deliveryType = data.get('deliveryType') as string
    const estimatedCost = parseFloat(data.get('estimatedCost') as string)

    const po = await prisma.purchaseOrder.findUnique({ where: { id: purchaseOrderId } })
    if (!po) return { error: 'PO not found.' }

    if (po.type === 'BLANKET' && po.remainingAmount !== null) {
      if (po.remainingAmount < estimatedCost) {
        return { error: 'Insufficient remaining amount on Blanket PO.' }
      }
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { remainingAmount: po.remainingAmount - estimatedCost }
      })
    }

    await prisma.purchaseSchedule.create({
      data: {
        purchaseOrderId,
        assetCategoryId,
        quantity,
        expectedDelivery: new Date(expectedDeliveryStr),
        deliveryType
      }
    })
    
    revalidatePath('/procure')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create schedule.' }
  }
}
