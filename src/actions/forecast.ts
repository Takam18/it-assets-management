'use server'

import { prisma } from '@/lib/db'

export type ForecastStatus = 'OVERDUE' | 'SOON' | 'UPCOMING' | 'FUTURE'

export type ForecastAsset = {
  id: string
  computerName: string
  model: string | null
  categoryName: string | null
  purchaseDate: Date
  replacementCost: number
  refreshDate: Date
  status: ForecastStatus
  daysUntilRefresh: number
  fiscalYear: number
  fiscalQuarter: number
  currentAgeYears: number
  orderInProgress: boolean
}

export type GroupedForecast = {
  fiscalYear: number;
  quarters: {
    quarter: number;
    assets: ForecastAsset[];
    totalCost: number;
  }[];
  totalCost: number;
  budget: number;
}

export async function getAssetForecast() {
  const assets = await prisma.asset.findMany({
    where: {
      purchaseDate: {
        not: null
      },
      status: {
        in: ['In Stock', 'Assigned', 'In Repair']
      }
    },
    include: {
      category: true
    },
    orderBy: {
      purchaseDate: 'asc'
    }
  })

  const budgets = prisma.fYBudget ? await prisma.fYBudget.findMany() : []
  const budgetMap = new Map(budgets.map(b => [b.fiscalYear, b.amount]))

  const now = new Date()
  
  const forecastData: ForecastAsset[] = assets.map((asset) => {
    let refreshDate: Date
    
    if (asset.expectedRefreshDate) {
      refreshDate = new Date(asset.expectedRefreshDate)
    } else {
      // Hardcoded 4 years (48 months) from purchase date
      refreshDate = new Date(asset.purchaseDate as Date)
      refreshDate.setFullYear(refreshDate.getFullYear() + 4)
    }
    
    const diffTime = refreshDate.getTime() - now.getTime()
    const daysUntilRefresh = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const ageTime = now.getTime() - new Date(asset.purchaseDate as Date).getTime()
    const currentAgeYears = Math.max(0, Math.round((ageTime / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10)

    let status: ForecastStatus = 'FUTURE'
    if (daysUntilRefresh < 0) {
      status = 'OVERDUE'
    } else if (daysUntilRefresh <= 180) {
      status = 'SOON'
    } else if (daysUntilRefresh <= 365) {
      status = 'UPCOMING'
    }
    
    const month = refreshDate.getMonth()
    const year = refreshDate.getFullYear()
    
    let fiscalYear = year
    let fiscalQuarter = 1
    
    if (month >= 8 && month <= 10) {
      // Sep, Oct, Nov -> Q1 of Next Calendar Year
      fiscalYear = year + 1
      fiscalQuarter = 1
    } else if (month === 11 || month <= 1) {
      // Dec, Jan, Feb -> Q2
      fiscalYear = month === 11 ? year + 1 : year
      fiscalQuarter = 2
    } else if (month >= 2 && month <= 4) {
      // Mar, Apr, May -> Q3
      fiscalYear = year
      fiscalQuarter = 3
    } else if (month >= 5 && month <= 7) {
      // Jun, Jul, Aug -> Q4
      fiscalYear = year
      fiscalQuarter = 4
    }

    return {
      id: asset.computerName, // because computerName is now the id
      computerName: asset.computerName,
      model: asset.model,
      categoryName: asset.category?.categoryName || 'Unknown',
      purchaseDate: asset.purchaseDate as Date,
      replacementCost: asset.category?.defaultPrice || asset.purchaseCost || 0,
      refreshDate,
      status,
      daysUntilRefresh,
      fiscalYear,
      fiscalQuarter,
      currentAgeYears,
      orderInProgress: asset.orderInProgress
    }
  })
  
  // Sort by days until refresh (most urgent first)
  forecastData.sort((a, b) => a.daysUntilRefresh - b.daysUntilRefresh)

  // Group by FY and FQ
  const groupedMap = new Map<number, Map<number, ForecastAsset[]>>()
  for (const asset of forecastData) {
    if (!groupedMap.has(asset.fiscalYear)) {
      groupedMap.set(asset.fiscalYear, new Map())
    }
    const fyMap = groupedMap.get(asset.fiscalYear)!
    if (!fyMap.has(asset.fiscalQuarter)) {
      fyMap.set(asset.fiscalQuarter, [])
    }
    fyMap.get(asset.fiscalQuarter)!.push(asset)
  }

  const grouped: GroupedForecast[] = Array.from(groupedMap.entries())
    .map(([fy, quartersMap]) => {
      const quarters = Array.from(quartersMap.entries())
        .map(([q, assets]) => ({
          quarter: q,
          assets,
          totalCost: assets.reduce((sum, a) => sum + a.replacementCost, 0)
        }))
        .sort((a, b) => a.quarter - b.quarter)

      return {
        fiscalYear: fy,
        quarters,
        totalCost: quarters.reduce((sum, q) => sum + q.totalCost, 0),
        budget: budgetMap.get(fy) || 0
      }
    })
    .sort((a, b) => a.fiscalYear - b.fiscalYear) // Sort FY ascending

  // Calculate current Fiscal Year and Quarter based on Today
  const nowMonth = now.getMonth()
  const nowYear = now.getFullYear()
  
  let currentFY = nowYear
  let currentFQ = 1
  
  if (nowMonth >= 8 && nowMonth <= 10) {
    currentFY = nowYear + 1
    currentFQ = 1
  } else if (nowMonth === 11 || nowMonth <= 1) {
    currentFY = nowMonth === 11 ? nowYear + 1 : nowYear
    currentFQ = 2
  } else if (nowMonth >= 2 && nowMonth <= 4) {
    currentFY = nowYear
    currentFQ = 3
  } else if (nowMonth >= 5 && nowMonth <= 7) {
    currentFY = nowYear
    currentFQ = 4
  }

  // Calculate Next Quarter
  let nextFQ = currentFQ === 4 ? 1 : currentFQ + 1
  let nextFY = currentFQ === 4 ? currentFY + 1 : currentFY

  // Aggregate Stats based on FY/FQ
  let totalCostOverdue = 0
  let overdueCount = 0
  let totalCostCurrentQ = 0
  let currentQCount = 0
  let totalCostNextQ = 0
  let nextQCount = 0

  for (const asset of forecastData) {
    const isPast = asset.fiscalYear < currentFY || (asset.fiscalYear === currentFY && asset.fiscalQuarter < currentFQ)
    const isCurrent = asset.fiscalYear === currentFY && asset.fiscalQuarter === currentFQ
    const isNext = asset.fiscalYear === nextFY && asset.fiscalQuarter === nextFQ

    if (isPast) {
      totalCostOverdue += asset.replacementCost
      overdueCount++
    } else if (isCurrent) {
      totalCostCurrentQ += asset.replacementCost
      currentQCount++
    } else if (isNext) {
      totalCostNextQ += asset.replacementCost
      nextQCount++
    }
  }

  return {
    items: forecastData,
    grouped,
    stats: {
      currentFY,
      currentFQ,
      nextFY,
      nextFQ,
      totalCostOverdue,
      overdueCount,
      totalCostCurrentQ,
      currentQCount,
      totalCostNextQ,
      nextQCount,
      totalTracked: forecastData.length
    }
  }
}

export async function updateAssetRefreshDate(assetId: string, newDate: Date) {
  try {
    await prisma.asset.update({
      where: { computerName: assetId },
      data: { expectedRefreshDate: newDate }
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to update asset refresh date:', error)
    return { success: false, error: 'Failed to update date' }
  }
}

export async function setOrderInProgress(assetIds: string[], status: boolean) {
  try {
    await prisma.asset.updateMany({
      where: { computerName: { in: assetIds } },
      data: { orderInProgress: status }
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to update ordering status:', error)
    return { success: false, error: 'Failed to update ordering status' }
  }
}

export async function setFYBudget(fiscalYear: number, amount: number) {
  try {
    if (!prisma.fYBudget) {
      throw new Error('Prisma Client has not reloaded yet. Please restart the dev server.')
    }
    await prisma.fYBudget.upsert({
      where: { fiscalYear },
      update: { amount },
      create: { fiscalYear, amount }
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to update FY Budget:', error)
    return { success: false, error: 'Failed to update budget' }
  }
}
