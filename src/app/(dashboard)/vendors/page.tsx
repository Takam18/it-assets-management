import { getVendors, deleteVendor, deleteVendors, importVendorsCsv } from '@/actions/vendors'
import { PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function VendorsPage() {
  const vendors = await getVendors()

  const rows = vendors.map(v => ({
    id: v.id,
    cells: [
      <strong key="name">{v.vendorName}</strong>,
      v.contactName || <span key="cname" className="text-muted">—</span>,
      <span key="email" className="text-sm">{v.contactEmail || <span className="text-muted">—</span>}</span>,
      v.supportPhone || <span key="phone" className="text-muted">—</span>,
      v._count.assets,
      v._count.maintenanceLogs,
      <Link key="edit" href={`/vendors/${v.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
    ]
  }))

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle={`${vendors.length} vendor${vendors.length !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Vendors' }]}
      />
      {vendors.length > 0 ? (
        <DataTable
          headers={['Vendor Name', 'Contact Name', 'Email', 'Support Phone', 'Assets', 'Maintenance Logs']}
          rows={rows}
          onDelete={deleteVendor}
          onBulkDelete={deleteVendors}
          onImport={importVendorsCsv}
          importTemplateHeaders="vendorName,contactName,phone,email,address,website"
          exportUrl="/api/export?model=vendors"
          addUrl="/vendors/new"
          addLabel="Add Vendor"
        />
      ) : (
        <div className="glass-card">
          <EmptyState icon="🏢" title="No vendors yet" description="Add your suppliers and service providers." action={<Link href="/vendors/new" className="btn btn-primary">+ Add Vendor</Link>} />
        </div>
      )}
    </div>
  )
}
