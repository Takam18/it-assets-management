import { getDepartments, deleteDepartment, deleteDepartments, importDepartmentsCsv } from '@/actions/departments'
import { PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function DepartmentsPage() {
  const departments = await getDepartments()

  const rows = departments.map(d => ({
    id: d.id,
    cells: [
      <strong key="name">{d.departmentName}</strong>,
      d.managerId || <span key="mgr" className="text-muted">—</span>,
      d._count.employees,
      <Link key="edit" href={`/departments/${d.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
    ]
  }))

  return (
    <div>
      <PageHeader title="Departments" subtitle={`${departments.length} department${departments.length !== 1 ? 's' : ''}`} breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Departments' }]} />
      {departments.length > 0 ? (
        <DataTable
          headers={['Department Name', 'Manager ID', 'Employees']}
          rows={rows}
          onDelete={deleteDepartment}
          onBulkDelete={deleteDepartments}
          onImport={importDepartmentsCsv}
          importTemplateHeaders="name,description"
          exportUrl="/api/export?model=departments"
          addUrl="/departments/new"
          addLabel="Add Department"
        />
      ) : (
        <div className="glass-card"><EmptyState icon="🏢" title="No departments yet" action={<Link href="/departments/new" className="btn btn-primary">+ Add Department</Link>} /></div>
      )}
    </div>
  )
}
