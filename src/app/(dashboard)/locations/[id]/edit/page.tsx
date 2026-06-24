import { getLocation } from '@/actions/locations'
import { PageHeader } from '@/components/ui'
import { LocationForm } from '../../LocationForm'
import { notFound } from 'next/navigation'

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const location = await getLocation(Number(id))
  if (!location) notFound()
  return (<div><PageHeader title={`Edit ${location.siteName}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Locations', href: '/locations' }, { label: 'Edit' }]} /><div className="glass-card animate-in"><LocationForm location={location} /></div></div>)
}
