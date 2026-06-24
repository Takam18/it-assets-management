import { PageHeader } from '@/components/ui'
import { DepartmentForm } from '../DepartmentForm'
export default function NewDepartmentPage() {
  return (<div><PageHeader title="Add New Department" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Departments', href: '/departments' }, { label: 'New' }]} /><div className="glass-card animate-in"><DepartmentForm /></div></div>)
}
