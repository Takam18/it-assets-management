import { PageHeader } from '@/components/ui'
import { AreaForm } from '../AreaForm'

export default function NewAreaPage() {
  return (
    <div>
      <PageHeader
        title="New Area"
        subtitle="Add a new building and room to the system"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Areas', href: '/areas' },
          { label: 'New' }
        ]}
      />
      <div className="glass-card animate-in">
        <AreaForm />
      </div>
    </div>
  )
}
