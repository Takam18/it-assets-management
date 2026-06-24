import { PageHeader } from '@/components/ui'
import { CategoryForm } from '../CategoryForm'
import { getCategories } from '@/actions/categories'

export default async function NewCategoryPage() {
  const allCategories = await getCategories()
  return (<div><PageHeader title="Add New Category" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Categories', href: '/categories' }, { label: 'New' }]} /><div className="glass-card animate-in"><CategoryForm allCategories={allCategories} /></div></div>)
}
