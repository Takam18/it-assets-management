import { getEmployees, deleteEmployee, deleteEmployees, importEmployeesCsv } from '@/actions/employees'
import { StatusBadge, PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function EmployeesPage() {
  const employees = await getEmployees()

  const rows = employees.map(emp => ({
    id: emp.id,
    cells: [
      <span key="empId" className="font-mono text-sm">{emp.employeeId || <span className="text-muted">—</span>}</span>,
      <Link key="name" href={`/employees/${emp.id}`}>
        <strong style={{ color: 'var(--accent-cyan)' }}>
          {emp.firstName} {emp.lastName}
        </strong>
      </Link>,
      <span key="email" className="text-sm">{emp.email}</span>,
      emp.department?.departmentName || <span key="dept" className="text-muted">—</span>,
      emp.location?.siteName || <span key="loc" className="text-muted">—</span>,
      <StatusBadge key="status" status={emp.status} />,
      emp._count.assignments,
      <Link key="edit" href={`/employees/${emp.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
    ]
  }))

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Employees' }]}
      />

      {employees.length > 0 ? (
        <DataTable
          headers={['Employee ID', 'Name', 'Email', 'Department', 'Location', 'Status', 'Assignments']}
          rows={rows}
          onDelete={deleteEmployee}
          onBulkDelete={deleteEmployees}
          onImport={importEmployeesCsv}
          importTemplateHeaders="firstName,lastName,email,title,phone,status"
          exportUrl="/api/export?model=employees"
          addUrl="/employees/new"
          addLabel="Add Employee"
        />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon="👤"
            title="No employees yet"
            description="Add employees to start assigning assets."
            action={<Link href="/employees/new" className="btn btn-primary">+ Add First Employee</Link>}
          />
        </div>
      )}
    </div>
  )
}
