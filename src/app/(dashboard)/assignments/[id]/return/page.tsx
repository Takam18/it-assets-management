import { getAssignment } from '@/actions/assignments'
import { PageHeader } from '@/components/ui'
import { ReturnForm } from './ReturnForm'
import { notFound, redirect } from 'next/navigation'

export default async function ReturnAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const assignment = await getAssignment(Number(id))
  if (!assignment) notFound()
  if (assignment.actualReturnDate) redirect('/assignments')

  const formatDate = (d: Date | string | null) => d ? new Date(d).toLocaleDateString() : '—'

  return (
    <div>
      <PageHeader
        title="Return Asset"
        subtitle={`${assignment.asset.computerName} → ${assignment.employee.firstName} ${assignment.employee.lastName}`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Assignments', href: '/assignments' }, { label: 'Return' }]}
      />

      <div className="glass-card animate-in" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="glass-card-header">
          <span className="glass-card-title">Assignment Details</span>
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Asset</div>
            <div className="detail-value">{assignment.asset.computerName} — {assignment.asset.category?.categoryName}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Employee</div>
            <div className="detail-value">{assignment.employee.firstName} {assignment.employee.lastName}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Assigned Date</div>
            <div className="detail-value">{formatDate(assignment.assignedDate)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Check-Out Condition</div>
            <div className={`detail-value ${!assignment.checkOutCondition ? 'muted' : ''}`}>{assignment.checkOutCondition || 'Not recorded'}</div>
          </div>
        </div>
      </div>

      <div className="glass-card animate-in animate-in-2">
        <ReturnForm assignmentId={assignment.id} />
      </div>
    </div>
  )
}
