import { getAssetStats } from '@/actions/assets'
import { StatusBadge } from '@/components/ui'
import Link from 'next/link'
import { CategoryBreakdownChart } from './CategoryBreakdownChart'
import { StatusDonutChart } from './StatusDonutChart'

export default async function DashboardPage() {
  const stats = await getAssetStats()
  const total = stats.total || 1 // prevent div by zero

  const barColors = ['cyan', 'emerald', 'amber', 'violet', 'rose'] as const

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">IT Asset Management Overview</p>
          </div>
        </div>
      </div>

      {/* Hero KPI Section */}
      <div className="glass-card animate-in animate-in-1" style={{ marginBottom: 'var(--space-xl)', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet), var(--accent-rose))'
        }} />
        
        <div style={{ padding: 'var(--space-xl)' }}>
          <h2 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-xl)' }}>Asset Overview</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6rem', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            {/* Hero Main 1 */}
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)' }}>Total Assets Managed</div>
              <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, textShadow: '0 0 30px rgba(6, 182, 212, 0.2)' }}>{stats.total}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', marginTop: 'var(--space-sm)' }}>${Number(stats.totalCost || 0).toLocaleString()} total value</div>
            </div>

            {/* Active Asset Distribution Donut */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <StatusDonutChart 
                inStock={stats.inStock} 
                assigned={stats.assigned} 
                inRepair={stats.inRepair} 
              />
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-md)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--glass-border)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>In Stock</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.inStock}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Assigned</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.assigned}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>In Repair</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.inRepair}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>Retired/Lost</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.retired + stats.lostStolen}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        {/* Assets by Category */}
        <div className="col-12 glass-card animate-in animate-in-3">
          <div className="glass-card-header">
            <span className="glass-card-title">By Category</span>
          </div>
          <CategoryBreakdownChart data={stats.categoryBreakdown} />
        </div>

        {/* Recent Assignments */}
        <div className="col-6 glass-card animate-in animate-in-4">
          <div className="glass-card-header">
            <span className="glass-card-title">Recent Assignments</span>
            <Link href="/assignments" className="btn btn-ghost btn-sm">
              View All →
            </Link>
          </div>
          <ul className="activity-list">
            {stats.recentAssignments.map((a) => (
              <li key={a.id} className="activity-item">
                <span
                  className={`activity-dot ${a.actualReturnDate ? 'emerald' : 'amber'}`}
                />
                <div className="activity-content">
                  <div className="activity-title">
                    {a.asset.computerName}
                    {a.asset.category ? ` (${a.asset.category.categoryName})` : ''}
                    {' → '}
                    {a.employee.firstName} {a.employee.lastName}
                  </div>
                  <div className="activity-meta">
                    {a.actualReturnDate ? 'Returned' : 'Assigned'}{' '}
                    {new Date(a.assignedDate).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
            {stats.recentAssignments.length === 0 && (
              <li className="text-muted text-sm" style={{ padding: '1rem 0' }}>
                No assignments yet
              </li>
            )}
          </ul>
        </div>

        {/* Warranty Alerts */}
        <div className="col-6 glass-card animate-in animate-in-5">
          <div className="glass-card-header">
            <span className="glass-card-title">⚠ Warranty Expiring (30 days)</span>
          </div>
          {stats.warrantyExpiringSoon.map((asset) => (
            <div key={asset.computerName} className="warranty-alert">
              <span className="warranty-alert-icon">⏰</span>
              <span className="warranty-alert-text">
                <Link href={`/assets/${asset.computerName}`}>
                  <strong>{asset.computerName}</strong>
                </Link>
                {' — '}
                {asset.model || asset.category?.categoryName || 'Unknown'}
              </span>
              <span className="warranty-alert-date">
                {asset.warrantyExpiration
                  ? new Date(asset.warrantyExpiration).toLocaleDateString()
                  : '—'}
              </span>
            </div>
          ))}
          {stats.warrantyExpiringSoon.length === 0 && (
            <p className="text-muted text-sm">
              No warranties expiring in the next 30 days ✓
            </p>
          )}
        </div>

        {/* Recent Maintenance */}
        <div className="col-12 glass-card animate-in animate-in-6">
          <div className="glass-card-header">
            <span className="glass-card-title">Recent Maintenance</span>
            <Link href="/maintenance" className="btn btn-ghost btn-sm">
              View All →
            </Link>
          </div>
          <ul className="activity-list">
            {stats.recentMaintenance.map((log) => {
              const typeColors: Record<string, string> = {
                Repair: 'rose',
                Upgrade: 'cyan',
                RoutineMaintenance: 'emerald',
                Audit: 'amber',
              }
              return (
                <li key={log.id} className="activity-item">
                  <span
                    className={`activity-dot ${typeColors[log.serviceType] || 'cyan'}`}
                  />
                  <div className="activity-content">
                    <div className="activity-title">
                      <Link href={`/assets/${log.assetId}`}>
                        {log.asset.computerName}
                      </Link>
                      {' — '}
                      <StatusBadge status={log.serviceType} />
                    </div>
                    <div className="activity-meta">
                      {log.description?.substring(0, 80) || 'No description'}
                      {' · '}
                      {new Date(log.serviceDate).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              )
            })}
            {stats.recentMaintenance.length === 0 && (
              <li className="text-muted text-sm" style={{ padding: '1rem 0' }}>
                No maintenance logs yet
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
