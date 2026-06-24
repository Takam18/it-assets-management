import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const model = searchParams.get('model')

  if (!model) {
    return new NextResponse('Model is required', { status: 400 })
  }

  try {
    let data: any[] = []
    let filename = `${model}-export-${new Date().toISOString().split('T')[0]}.csv`

    switch (model) {
      case 'locations':
        data = await prisma.location.findMany({ orderBy: { siteName: 'asc' } })
        break
      case 'departments':
        data = await prisma.department.findMany({ orderBy: { departmentName: 'asc' } })
        break
      case 'employees':
        data = await prisma.employee.findMany({
          include: { department: true, location: true },
          orderBy: { lastName: 'asc' }
        })
        data = data.map(e => ({
          ...e,
          departmentName: e.department?.departmentName,
          locationName: e.location?.siteName
        }))
        break
      case 'vendors':
        data = await prisma.vendor.findMany({ orderBy: { vendorName: 'asc' } })
        break
      case 'brands':
        data = await prisma.brand.findMany({ orderBy: { brandName: 'asc' } })
        break
      case 'areas':
        data = await prisma.area.findMany({ orderBy: { building: 'asc' } })
        break
      case 'categories':
        data = await prisma.assetCategory.findMany({ orderBy: { categoryName: 'asc' } })
        break
      case 'assignments':
        data = await prisma.assetAssignment.findMany({ orderBy: { assignedDate: 'desc' } })
        break
      case 'maintenance':
        data = await prisma.maintenanceLog.findMany({ orderBy: { serviceDate: 'desc' } })
        break
      default:
        return new NextResponse('Invalid model', { status: 400 })
    }

    if (data.length === 0) {
      return new NextResponse('No data found to export.', { status: 404 })
    }

    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object')
    const csvRows = []
    csvRows.push(keys.join(','))

    for (const row of data) {
      const values = keys.map((k) => {
        const val = row[k]
        if (val === null || val === undefined) return ''
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      })
      csvRows.push(values.join(','))
    }

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
