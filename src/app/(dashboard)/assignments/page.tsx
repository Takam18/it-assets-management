import { getAssignments, deleteAssignment, deleteAssignments } from '@/actions/assignments'
import { PageHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeTab = tab || 'Active'
  const allAssignments = await getAssignments()
  
  const filtered = allAssignments.filter(a => {
    if (activeTab === 'Active') return !a.actualReturnDate
    return !!a.actualReturnDate
  })

  const activeCount = allAssignments.filter(a => !a.actualReturnDate).length
  const returnedCount = allAssignments.filter(a => !!a.actualReturnDate).length

  const formatDate = (d: Date | string | null | undefined) => d ? new Date(d).toLocaleDateString() : '—'

  const headers = ['Asset', 'Category', 'Employee', 'Department', 'Assigned Date']
  if (activeTab === 'Active') {
    headers.push('Expected Return', 'Return')
  } else {
    headers.push('Actual Return', 'Out Condition', 'In Condition')
  }

  const rows = filtered.map(a => {
    const cells = [
      <Link key="asset" href={`/assets/${a.asset.computerName}`} style={{ color: 'var(--accent-cyan)' }}>
        <strong>{a.asset.computerName}</strong>
      </Link>,
      a.asset.category?.categoryName || '—',
      <Link key="emp" href={`/employees/${a.employee.id}`}>
        {a.employee.firstName} {a.employee.lastName}
      </Link>,
      a.employee.department?.departmentName || '—',
      formatDate(a.assignedDate),
    ]

    if (activeTab === 'Active') {
      cells.push(
        formatDate(a.expectedReturnDate),
        <Link key="return" href={`/assignments/${a.id}/return`} className="btn btn-ghost btn-sm">Return ↩</Link>
      )
    } else {
      cells.push(
        formatDate(a.actualReturnDate),
        <span key="out" className="text-sm truncate" style={{ maxWidth: '120px' }}>{a.checkOutCondition || '—'}</span>,
        <span key="in" className="text-sm truncate" style={{ maxWidth: '120px' }}>{a.checkInCondition || '—'}</span>
      )
    }

    return { id: a.id, cells }
  })

  return (
    <div>
      <PageHeader
        title="Asset Assignments"
        subtitle={`${activeCount} active · ${returnedCount} returned`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assignments' }]}
      />

      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <Link 
          href="?tab=Active" 
          className={`category-tab-btn ${activeTab === 'Active' ? 'active' : ''}`}
        >
          Active Assignments
        </Link>
        <Link 
          href="?tab=Returned" 
          className={`category-tab-btn ${activeTab === 'Returned' ? 'active' : ''}`}
        >
          Returned
        </Link>
      </div>

      {filtered.length > 0 ? (
        <DataTable
          headers={headers}
          rows={rows}
          onDelete={deleteAssignment}
          onBulkDelete={deleteAssignments}
          exportUrl="/api/export?model=assignments"
          addUrl="/assignments/new"
          addLabel="New Assignment"
        />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon="🤝"
            title="No assignments found"
            description={activeTab === 'Active' ? 'There are no active assignments.' : 'There are no returned assignments.'}
            action={activeTab === 'Active' ? <Link href="/assignments/new" className="btn btn-primary">+ New Assignment</Link> : undefined}
          />
        </div>
      )}
    </div>
  )
}
