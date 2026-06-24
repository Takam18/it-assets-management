import { PageHeader } from '@/components/ui'
import { LocationForm } from '../LocationForm'
export default function NewLocationPage() {
  return (<div><PageHeader title="Add New Location" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Locations', href: '/locations' }, { label: 'New' }]} /><div className="glass-card animate-in"><LocationForm /></div></div>)
}
