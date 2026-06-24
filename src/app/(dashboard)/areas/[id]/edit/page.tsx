import { PageHeader } from '@/components/ui'
import { AreaForm } from '../../AreaForm'
import { getArea } from '@/actions/areas'
import { notFound } from 'next/navigation'

export default async function EditAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const area = await getArea(Number(id))
  
  if (!area) notFound()

  return (
    <div>
      <PageHeader
        title="Edit Area"
        subtitle={`Update details for ${area.building} - ${area.room}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Areas', href: '/areas' },
          { label: 'Edit' }
        ]}
      />
      <div className="glass-card animate-in">
        <AreaForm initialData={area} />
      </div>
    </div>
  )
}
