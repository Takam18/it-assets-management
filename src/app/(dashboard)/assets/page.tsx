import { getAssets } from '@/actions/assets'
import { StatusBadge, PageHeader, EmptyState } from '@/components/ui'
import { AssetFilters } from './AssetFilters'
import { AssetList } from './AssetList'
import Link from 'next/link'

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const assets = await getAssets(params.search, params.status)

  return (
    <div>
      <PageHeader
        title="Assets"
        subtitle={`${assets.length} asset${assets.length !== 1 ? 's' : ''} in inventory`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assets' }]}
      />

      <AssetFilters currentSearch={params.search} currentStatus={params.status} />

      {assets.length > 0 ? (
        <AssetList assets={assets} search={params.search} status={params.status} />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon="💻"
            title="No assets found"
            description={
              params.search || params.status
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first asset.'
            }
            action={
              !params.search && !params.status ? (
                <Link href="/assets/new" className="btn btn-primary">
                  + Add First Asset
                </Link>
              ) : undefined
            }
          />
        </div>
      )}
    </div>
  )
}
