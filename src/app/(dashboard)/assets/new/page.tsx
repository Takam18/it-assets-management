import { getCategories } from '@/actions/categories'
import { getVendors } from '@/actions/vendors'
import { getLocations } from '@/actions/locations'
import { getBrands } from '@/actions/brands'
import { getAreas } from '@/actions/areas'
import { PageHeader } from '@/components/ui'
import { AssetForm } from '../AssetForm'

export default async function NewAssetPage() {
  const [categories, vendors, locations, brands, areas] = await Promise.all([
    getCategories(),
    getVendors(),
    getLocations(),
    getBrands(),
    getAreas(),
  ])

  return (
    <div>
      <PageHeader
        title="Add New Asset"
        subtitle="Register a new asset in the inventory"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Assets', href: '/assets' },
          { label: 'New Asset' },
        ]}
      />
      <div className="glass-card animate-in">
        <AssetForm categories={categories} vendors={vendors} locations={locations} brands={brands} areas={areas} />
      </div>
    </div>
  )
}
