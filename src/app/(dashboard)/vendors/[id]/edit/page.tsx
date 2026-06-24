import { getVendor } from '@/actions/vendors'
import { PageHeader } from '@/components/ui'
import { VendorForm } from '../../VendorForm'
import { notFound } from 'next/navigation'

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vendor = await getVendor(Number(id))
  if (!vendor) notFound()

  return (
    <div>
      <PageHeader title={`Edit ${vendor.vendorName}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Vendors', href: '/vendors' }, { label: 'Edit' }]} />
      <div className="glass-card animate-in"><VendorForm vendor={vendor} /></div>
    </div>
  )
}
