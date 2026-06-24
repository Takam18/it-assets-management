import { getCategory, getCategories } from '@/actions/categories'
import { PageHeader } from '@/components/ui'
import { CategoryForm } from '../../CategoryForm'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [category, allCategories] = await Promise.all([
    getCategory(Number(id)),
    getCategories()
  ])
  if (!category) notFound()
  return (<div><PageHeader title={`Edit ${category.categoryName}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Categories', href: '/categories' }, { label: 'Edit' }]} /><div className="glass-card animate-in"><CategoryForm category={category} allCategories={allCategories} /></div></div>)
}
