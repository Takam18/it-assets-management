import { prisma } from '@/lib/db'
import { PageHeader } from '@/components/ui'
import { AssignmentForm } from '../AssignmentForm'

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ assetId?: string }>
}) {
  const params = await searchParams
  const [assets, employees] = await Promise.all([
    prisma.asset.findMany({
      where: { status: { notIn: ['Retired', 'LostStolen'] } },
      orderBy: { computerName: 'asc' },
    }),
    prisma.employee.findMany({
      where: { status: 'Active' },
      orderBy: { lastName: 'asc' },
    }),
  ])

  return (
    <div>
      <PageHeader
        title="New Assignment"
        subtitle="Assign an asset to an employee"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assignments', href: '/assignments' }, { label: 'New Assignment' }]}
      />
      <div className="glass-card animate-in">
        <AssignmentForm
          assets={assets}
          employees={employees}
          defaultAssetId={params.assetId}
        />
      </div>
    </div>
  )
}
