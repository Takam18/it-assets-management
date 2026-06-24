import { getAsset } from '@/actions/assets'
import { getCategories } from '@/actions/categories'
import { getVendors } from '@/actions/vendors'
import { getLocations } from '@/actions/locations'
import { getBrands } from '@/actions/brands'
import { getAreas } from '@/actions/areas'
import { PageHeader } from '@/components/ui'
import { AssetForm } from '../../AssetForm'
import { notFound } from 'next/navigation'

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [asset, categories, vendors, locations, brands, areas] = await Promise.all([
    getAsset(id),
    getCategories(),
    getVendors(),
    getLocations(),
    getBrands(),
    getAreas(),
  ])

  if (!asset) notFound()

  return (
    <div>
      <PageHeader
        title={`Edit ${asset.computerName}`}
        subtitle="Update asset information"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Assets', href: '/assets' },
          { label: asset.computerName, href: `/assets/${asset.computerName}` },
          { label: 'Edit' },
        ]}
      />
      <div className="glass-card animate-in">
        <AssetForm
          asset={asset}
          categories={categories}
          vendors={vendors}
          locations={locations}
          brands={brands}
          areas={areas}
        />
      </div>
    </div>
  )
}
