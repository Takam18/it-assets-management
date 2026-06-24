import { getAssets } from '@/actions/assets'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') || undefined

    const assets = await getAssets(search, status)

    // Define CSV headers
    const headers = [
      'Computer Name',
      'Category',
      'Model',
      'Serial Number',
      'Status',
      'Location',
      'Purchase Date',
      'Cost',
      'Notes',
    ]

    // Convert asset data to CSV rows
    const rows = assets.map((asset: any) => [
      asset.computerName,
      asset.category?.categoryName || '',
      asset.model || '',
      asset.serialNumber || '',
      asset.status,
      asset.location?.siteName || '',
      asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
      asset.purchaseCost?.toString() || '',
      asset.notes ? `"${asset.notes.replace(/"/g, '""')}"` : '',
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="assets-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export CSV Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
