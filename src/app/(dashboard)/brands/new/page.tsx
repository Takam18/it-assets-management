import { PageHeader } from '@/components/ui'
import { BrandForm } from '../BrandForm'

export default function NewBrandPage() {
  return (
    <div>
      <PageHeader
        title="Add Brand"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Brands', href: '/brands' },
          { label: 'New' }
        ]}
      />
      <div className="glass-card max-w-2xl">
        <BrandForm />
      </div>
    </div>
  )
}
