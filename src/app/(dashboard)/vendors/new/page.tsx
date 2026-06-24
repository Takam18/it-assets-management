import { PageHeader } from '@/components/ui'
import { VendorForm } from '../VendorForm'

export default function NewVendorPage() {
  return (
    <div>
      <PageHeader title="Add New Vendor" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Vendors', href: '/vendors' }, { label: 'New Vendor' }]} />
      <div className="glass-card animate-in"><VendorForm /></div>
    </div>
  )
}
