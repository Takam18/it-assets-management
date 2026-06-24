import { getMaintenanceLogs, deleteMaintenanceLog, deleteMaintenanceLogs } from '@/actions/maintenance'
import { PageHeader, EmptyState, StatusBadge } from '@/components/ui'
import Link from 'next/link'
import { DataTable } from '@/components/ui/DataTable'

export default async function MaintenancePage() {
  const logs = await getMaintenanceLogs()

  const formatDate = (d: Date | string | null | undefined) => d ? new Date(d).toLocaleDateString() : '—'

  const rows = logs.map(log => ({
    id: log.id,
    cells: [
      <Link key="asset" href={`/assets/${log.asset.computerName}`} style={{ color: 'var(--accent-cyan)' }}>
        <strong>{log.asset.computerName}</strong>
      </Link>,
      formatDate(log.serviceDate),
      <StatusBadge key="type" status={log.serviceType} />,
      log.vendor?.vendorName || <span key="vend" className="text-muted">—</span>,
      log.cost ? `$${Number(log.cost).toLocaleString()}` : <span key="cost" className="text-muted">—</span>,
      log.performedBy || <span key="perf" className="text-muted">—</span>,
      <span key="desc" className="text-sm truncate" style={{ maxWidth: '250px' }} title={log.description || ''}>
        {log.description || '—'}
      </span>
    ]
  }))

  return (
    <div>
      <PageHeader
        title="Maintenance Logs"
        subtitle={`${logs.length} maintenance record${logs.length !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Maintenance' }]}
      />

      {logs.length > 0 ? (
        <DataTable
          headers={['Asset', 'Service Date', 'Type', 'Vendor', 'Cost', 'Performed By', 'Description']}
          rows={rows}
          onDelete={deleteMaintenanceLog}
          onBulkDelete={deleteMaintenanceLogs}
          exportUrl="/api/export?model=maintenanceLogs"
          addUrl="/maintenance/new"
          addLabel="Log Maintenance"
        />
      ) : (
        <div className="glass-card">
          <EmptyState
            icon="🔧"
            title="No maintenance logs yet"
            description="Log repairs, upgrades, and audits for your assets."
            action={<Link href="/maintenance/new" className="btn btn-primary">+ Log First Maintenance</Link>}
          />
        </div>
      )}
    </div>
  )
}
