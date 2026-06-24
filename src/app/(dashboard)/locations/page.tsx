import { getLocations, deleteLocation, deleteLocations, importLocationsCsv } from '@/actions/locations'
import { PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function LocationsPage() {
  const locations = await getLocations()

  const rows = locations.map(l => ({
    id: l.id,
    cells: [
      <strong key="siteName">{l.siteName}</strong>,
      l.address || <span key="address" className="text-muted">—</span>,
      l.city || <span key="city" className="text-muted">—</span>,
      l.country || <span key="country" className="text-muted">—</span>,
      l._count.employees,
      l._count.assets,
      <Link key="edit" href={`/locations/${l.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
    ]
  }))

  return (
    <div>
      <PageHeader title="Locations" subtitle={`${locations.length} location${locations.length !== 1 ? 's' : ''}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Locations' }]} />
      {locations.length > 0 ? (
        <DataTable
          headers={['Site Name', 'Address', 'City', 'Country', 'Employees', 'Assets']}
          rows={rows}
          onDelete={deleteLocation}
          onBulkDelete={deleteLocations}
          onImport={importLocationsCsv}
          importTemplateHeaders="siteName,address,city,state,country,zipCode"
          exportUrl="/api/export?model=locations"
          addUrl="/locations/new"
          addLabel="Add Location"
        />
      ) : (
        <div className="glass-card"><EmptyState icon="📍" title="No locations yet" action={<Link href="/locations/new" className="btn btn-primary">+ Add Location</Link>} /></div>
      )}
    </div>
  )
}
