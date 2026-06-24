import { getAreas, deleteArea, deleteAreas, importAreasCsv } from '@/actions/areas'
import { PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function AreasPage() {
  const areas = await getAreas()

  const rows = areas.map(a => ({
    id: a.id,
    cells: [
      <strong key="bldg">{a.building}</strong>,
      <span key="loc">{a.location}</span>,
      <span key="room">{a.room}</span>,
      <span key="rem">{a.remark || '—'}</span>,
      <Link key="edit" href={`/areas/${a.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
    ]
  }))

  return (
    <div>
      <PageHeader
        title="Areas"
        subtitle="Manage internal buildings and rooms"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Areas' }]}
      />

      {areas.length > 0 ? (
        <DataTable
          headers={['Building', 'Area', 'Room', 'Remark']}
          rows={rows}
          onDelete={deleteArea}
          onBulkDelete={deleteAreas}
          onImport={importAreasCsv}
          importTemplateHeaders="location,building,room,remark"
          exportUrl="/api/export?model=areas"
          addUrl="/areas/new"
          addLabel="Add Area"
        />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon="🏢"
            title="No areas found"
            description="Get started by creating your first area."
            action={
              <Link href="/areas/new" className="btn btn-primary">
                Add Area
              </Link>
            }
          />
        </div>
      )}
    </div>
  )
}
