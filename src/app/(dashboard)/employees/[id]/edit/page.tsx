import { getEmployee } from '@/actions/employees'
import { getDepartments } from '@/actions/departments'
import { getLocations } from '@/actions/locations'
import { PageHeader } from '@/components/ui'
import { EmployeeForm } from '../../EmployeeForm'
import { notFound } from 'next/navigation'

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [employee, departments, locations] = await Promise.all([
    getEmployee(Number(id)),
    getDepartments(),
    getLocations(),
  ])
  if (!employee) notFound()

  return (
    <div>
      <PageHeader
        title={`Edit ${employee.firstName} ${employee.lastName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Employees', href: '/employees' },
          { label: `${employee.firstName} ${employee.lastName}`, href: `/employees/${employee.id}` },
          { label: 'Edit' },
        ]}
      />
      <div className="glass-card animate-in">
        <EmployeeForm employee={employee} departments={departments} locations={locations} />
      </div>
    </div>
  )
}
