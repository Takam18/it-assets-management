import { getCategories, deleteCategory, deleteCategories, importCategoriesCsv } from '@/actions/categories'
import { PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function CategoriesPage() {
  const categories = await getCategories()

  const rows = categories.map(c => ({
    id: c.id,
    cells: [
      <span key="name">
        {c.parent && <span className="text-muted text-sm mr-2">{c.parent.categoryName} &gt; </span>}
        <strong>{c.categoryName}</strong>
      </span>,
      <span key="desc" className="text-sm truncate" style={{ maxWidth: '300px', display: 'inline-block' }}>{c.description || <span className="text-muted">—</span>}</span>,
      c._count.assets,
      <Link key="edit" href={`/categories/${c.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
    ]
  }))

  return (
    <div>
      <PageHeader title="Asset Categories" subtitle={`${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Categories' }]} />
      {categories.length > 0 ? (
        <DataTable
          headers={['Category Name', 'Description', 'Assets']}
          rows={rows}
          onDelete={deleteCategory}
          onBulkDelete={deleteCategories}
          onImport={importCategoriesCsv}
          importTemplateHeaders="categoryName,description,prefix"
          exportUrl="/api/export?model=categories"
          addUrl="/categories/new"
          addLabel="Add Category"
        />
      ) : (
        <div className="glass-card"><EmptyState icon="📁" title="No categories yet" description="Categories help organize your assets." action={<Link href="/categories/new" className="btn btn-primary">+ Add Category</Link>} /></div>
      )}
    </div>
  )
}
