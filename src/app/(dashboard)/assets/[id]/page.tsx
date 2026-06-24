import { getAsset } from '@/actions/assets'
import { PageHeader, StatusBadge } from '@/components/ui'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AssetDeleteButton } from './AssetDeleteButton'

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const asset = await getAsset(id)

  if (!asset) notFound()

  const isCNCMachine = asset.category?.categoryName?.toLowerCase().includes('cnc machine')

  const formatDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString() : '—'

  const calculateAge = (d: Date | string | null) => {
    if (!d) return '—'
    const purchase = new Date(d)
    const now = new Date()
    const diffMs = now.getTime() - purchase.getTime()
    if (diffMs < 0) return 'Future purchase'
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25)
    
    if (diffYears < 1) {
      const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
      return diffMonths <= 0 ? '< 1 month' : `${diffMonths} month${diffMonths > 1 ? 's' : ''}`
    }
    
    return `${diffYears.toFixed(1)} years`
  }

  return (
    <div>
      <PageHeader
        title={asset.computerName}
        subtitle={`${asset.category?.categoryName || 'Uncategorized'} · ${asset.model || 'Unknown model'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Assets', href: '/assets' },
          { label: asset.computerName },
        ]}
        actions={
          <>
            <Link href={`/assets/${asset.computerName}/edit`} className="btn btn-secondary">
              ✏️ Edit
            </Link>
            <AssetDeleteButton id={asset.computerName} tag={asset.computerName} />
          </>
        }
      />

      {/* Asset Details */}
      <div className="glass-card animate-in animate-in-1" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="glass-card-header">
          <span className="glass-card-title">Asset Information</span>
          <StatusBadge status={asset.status} />
        </div>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Computer Name / Asset ID</div>
            <div className={`detail-value font-mono ${!asset.computerName ? 'muted' : ''}`}>
              {asset.computerName || 'Not set'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Serial Number</div>
            <div className={`detail-value font-mono ${!asset.serialNumber ? 'muted' : ''}`}>
              {asset.serialNumber || 'Not set'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Model</div>
            <div className={`detail-value ${!asset.model ? 'muted' : ''}`}>
              {asset.model || 'Not set'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Category</div>
            <div className={`detail-value ${!asset.category ? 'muted' : ''}`}>
              {asset.category?.categoryName || 'Uncategorized'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Vendor</div>
            <div className={`detail-value ${!asset.vendor ? 'muted' : ''}`}>
              {asset.vendor?.vendorName || 'Not set'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Location</div>
            <div className={`detail-value ${!asset.location ? 'muted' : ''}`}>
              {asset.location?.siteName || 'Not set'}
            </div>
          </div>
          {!isCNCMachine && (
            <>
              <div className="detail-item">
                <div className="detail-label">Purchase Date</div>
                <div className="detail-value">{formatDate(asset.purchaseDate)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Purchase Cost</div>
                <div className="detail-value">
                  {asset.purchaseCost ? `$${Number(asset.purchaseCost).toLocaleString()}` : '—'}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Aging</div>
                <div className="detail-value">{calculateAge(asset.purchaseDate)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Warranty Expiration</div>
                <div className="detail-value">{formatDate(asset.warrantyExpiration)}</div>
              </div>
            </>
          )}
        </div>
        {asset.notes && (
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div className="detail-label">Notes</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              {asset.notes}
            </p>
          </div>
        )}
      </div>

      <div className="bento-grid">
        {/* Area Information */}
        <div className="col-12 glass-card animate-in animate-in-2" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="glass-card-header">
            <span className="glass-card-title">Area Information</span>
          </div>
          {asset.area ? (
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Building</div>
                <div className="detail-value font-mono">{asset.area.building}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Area</div>
                <div className="detail-value">{asset.area.location}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Room</div>
                <div className="detail-value font-mono">{asset.area.room}</div>
              </div>
              {asset.area.remark && (
                <div className="detail-item">
                  <div className="detail-label">Remark</div>
                  <div className="detail-value">{asset.area.remark}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted text-sm">No area assigned to this asset.</p>
          )}
        </div>

        {/* Assignment History */}
        <div className="col-6 glass-card animate-in animate-in-2">
          <div className="glass-card-header">
            <span className="glass-card-title">Assignment History</span>
            {asset.status === 'In Stock' && (
              <Link href={`/assignments/new?assetId=${asset.computerName}`} className="btn btn-ghost btn-sm">
                Assign →
              </Link>
            )}
          </div>
          {asset.assignments.length > 0 ? (
            <ul className="activity-list">
              {asset.assignments.map((a) => (
                <li key={a.id} className="activity-item">
                  <span className={`activity-dot ${a.actualReturnDate ? 'emerald' : 'amber'}`} />
                  <div className="activity-content">
                    <div className="activity-title">
                      {a.employee.firstName} {a.employee.lastName}
                    </div>
                    <div className="activity-meta">
                      {formatDate(a.assignedDate)}
                      {a.actualReturnDate
                        ? ` → ${formatDate(a.actualReturnDate)}`
                        : ' — Currently assigned'}
                    </div>
                    {a.checkOutCondition && (
                      <div className="activity-meta">Out: {a.checkOutCondition}</div>
                    )}
                    {a.checkInCondition && (
                      <div className="activity-meta">In: {a.checkInCondition}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-sm">No assignments yet</p>
          )}
        </div>

        {/* Maintenance History */}
        <div className="col-6 glass-card animate-in animate-in-3">
          <div className="glass-card-header">
            <span className="glass-card-title">Maintenance History</span>
            <Link href={`/maintenance/new?assetId=${asset.computerName}`} className="btn btn-ghost btn-sm">
              Log Maintenance →
            </Link>
          </div>
          {asset.maintenanceLogs.length > 0 ? (
            <ul className="activity-list">
              {asset.maintenanceLogs.map((log) => (
                <li key={log.id} className="activity-item">
                  <span className="activity-dot cyan" />
                  <div className="activity-content">
                    <div className="activity-title">
                      <StatusBadge status={log.serviceType} />
                      {log.cost && ` — $${Number(log.cost).toLocaleString()}`}
                    </div>
                    <div className="activity-meta">
                      {formatDate(log.serviceDate)}
                      {log.performedBy && ` · By ${log.performedBy}`}
                    </div>
                    {log.description && (
                      <div className="activity-meta">{log.description}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-sm">No maintenance logs yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
