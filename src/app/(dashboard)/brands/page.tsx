import { getBrands, deleteBrand, deleteBrands, importBrandsCsv } from '@/actions/brands'
import { PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function BrandsPage() {
  const brands = await getBrands()

  const rows = brands.map(b => ({
    id: b.id,
    cells: [
      <strong key="name">{b.brandName}</strong>,
      <Link key="edit" href={`/brands/${b.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
    ]
  }))

  return (
    <div>
      <PageHeader
        title="Brands"
        subtitle="Manage asset brands and manufacturers"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reference Data' },
          { label: 'Brands' }
        ]}
      />

      {brands.length > 0 ? (
        <DataTable
          headers={['Brand Name']}
          rows={rows}
          onDelete={deleteBrand}
          onBulkDelete={deleteBrands}
          onImport={importBrandsCsv}
          importTemplateHeaders="brandName"
          exportUrl="/api/export?model=brands"
          addUrl="/brands/new"
          addLabel="Add Brand"
        />
      ) : (
        <div className="glass-card">
          <EmptyState 
            icon="🏷️" 
            title="No brands yet" 
            description="Use the form to add a new brand." 
            action={<Link href="/brands/new" className="btn btn-primary">+ Add Brand</Link>}
          />
        </div>
      )}
    </div>
  )
}
