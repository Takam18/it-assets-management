import { prisma } from '@/lib/db'
import { getVendors } from '@/actions/vendors'
import { PageHeader } from '@/components/ui'
import { MaintenanceForm } from '../MaintenanceForm'

export default async function NewMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ assetId?: string }>
}) {
  const params = await searchParams
  const [assets, vendors] = await Promise.all([
    prisma.asset.findMany({ orderBy: { computerName: 'asc' } }),
    getVendors(),
  ])

  return (
    <div>
      <PageHeader
        title="Log Maintenance"
        subtitle="Record a repair, upgrade, or audit"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Maintenance', href: '/maintenance' }, { label: 'New Log' }]}
      />
      <div className="glass-card animate-in">
        <MaintenanceForm
          assets={assets}
          vendors={vendors}
          defaultAssetId={params.assetId}
        />
      </div>
    </div>
  )
}
