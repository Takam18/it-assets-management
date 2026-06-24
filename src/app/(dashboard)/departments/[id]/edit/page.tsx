import { getDepartment } from '@/actions/departments'
import { PageHeader } from '@/components/ui'
import { DepartmentForm } from '../../DepartmentForm'
import { notFound } from 'next/navigation'

export default async function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const department = await getDepartment(Number(id))
  if (!department) notFound()
  return (<div><PageHeader title={`Edit ${department.departmentName}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Departments', href: '/departments' }, { label: 'Edit' }]} /><div className="glass-card animate-in"><DepartmentForm department={department} /></div></div>)
}
