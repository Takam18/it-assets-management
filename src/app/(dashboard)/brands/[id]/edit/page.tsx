import { PageHeader } from '@/components/ui'
import { BrandForm } from '../../BrandForm'
import { getBrandById } from '@/actions/brands'
import { notFound } from 'next/navigation'

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await getBrandById(Number(id))
  
  if (!brand) {
    notFound()
  }

  return (
    <div>
      <PageHeader
        title="Edit Brand"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Brands', href: '/brands' },
          { label: 'Edit' }
        ]}
      />
      <div className="glass-card max-w-2xl">
        <BrandForm brand={brand} />
      </div>
    </div>
  )
}
