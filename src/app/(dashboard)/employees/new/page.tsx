import { getDepartments } from '@/actions/departments'
import { getLocations } from '@/actions/locations'
import { PageHeader } from '@/components/ui'
import { EmployeeForm } from '../EmployeeForm'

export default async function NewEmployeePage() {
  const [departments, locations] = await Promise.all([getDepartments(), getLocations()])
  return (
    <div>
      <PageHeader
        title="Add New Employee"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Employees', href: '/employees' }, { label: 'New Employee' }]}
      />
      <div className="glass-card animate-in">
        <EmployeeForm departments={departments} locations={locations} />
      </div>
    </div>
  )
}
