import { getEmployee } from '@/actions/employees'
import { StatusBadge, PageHeader } from '@/components/ui'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const employee = await getEmployee(Number(id))
  if (!employee) notFound()

  const formatDate = (d: Date | string | null) => d ? new Date(d).toLocaleDateString() : '—'

  return (
    <div>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        subtitle={employee.email}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Employees', href: '/employees' }, { label: `${employee.firstName} ${employee.lastName}` }]}
        actions={<Link href={`/employees/${employee.id}/edit`} className="btn btn-secondary">✏️ Edit</Link>}
      />

      <div className="glass-card animate-in" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="glass-card-header">
          <span className="glass-card-title">Employee Information</span>
          <StatusBadge status={employee.status} />
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Full Name</div>
            <div className="detail-value">{employee.firstName} {employee.lastName}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{employee.email}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Department</div>
            <div className={`detail-value ${!employee.department ? 'muted' : ''}`}>
              {employee.department?.departmentName || 'Not assigned'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Location</div>
            <div className={`detail-value ${!employee.location ? 'muted' : ''}`}>
              {employee.location?.siteName || 'Not assigned'}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card animate-in animate-in-2">
        <div className="glass-card-header">
          <span className="glass-card-title">Asset Assignments ({employee.assignments.length})</span>
        </div>
        {employee.assignments.length > 0 ? (
          <ul className="activity-list">
            {employee.assignments.map((a) => (
              <li key={a.id} className="activity-item">
                <span className={`activity-dot ${a.actualReturnDate ? 'emerald' : 'amber'}`} />
                <div className="activity-content">
                  <div className="activity-title">
                    <Link href={`/assets/${a.asset.computerName}`}>{a.asset.computerName}</Link>
                    {a.asset.category && ` — ${a.asset.category.categoryName}`}
                  </div>
                  <div className="activity-meta">
                    {formatDate(a.assignedDate)}
                    {a.actualReturnDate ? ` → ${formatDate(a.actualReturnDate)}` : ' — Currently assigned'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted text-sm">No assignments yet</p>
        )}
      </div>
    </div>
  )
}
