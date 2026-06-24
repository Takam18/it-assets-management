import { PageHeader } from '@/components/ui'
import { getCategories } from '@/actions/categories'
import { PricingList } from './PricingList'

export default async function PricingPage() {
  const categories = await getCategories()

  // Only show categories that don't have parents, or all of them.
  // The user probably wants Desktop/Laptop which might be top-level or child.
  // We'll show all categories.
  
  return (
    <div>
      <PageHeader
        title="Category Pricing Defaults"
        subtitle="Set reference prices for specific asset categories (e.g. Desktop, Laptop, Workstation)."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Settings', href: '#' },
          { label: 'Pricing Defaults' }
        ]}
      />
      <PricingList categories={categories} />
    </div>
  )
}
