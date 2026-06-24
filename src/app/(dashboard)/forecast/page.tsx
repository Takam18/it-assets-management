import { getAssetForecast, ForecastStatus } from '@/actions/forecast'
import { PageHeader } from '@/components/ui'
import ForecastKanban from './ForecastKanban'

export default async function ForecastPage() {
  const { items, stats, grouped } = await getAssetForecast()
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const getStatusBadgeClass = (status: ForecastStatus) => {
    switch(status) {
      case 'OVERDUE': return 'status-badge loststolen' // red
      case 'SOON': return 'status-badge assigned' // amber
      case 'UPCOMING': return 'status-badge inrepair' // violet
      case 'FUTURE': return 'status-badge in-stock' // green
    }
  }
  
  const getStatusLabel = (status: ForecastStatus) => {
    switch(status) {
      case 'OVERDUE': return 'Overdue for Refresh'
      case 'SOON': return '< 6 Months'
      case 'UPCOMING': return '6-12 Months'
      case 'FUTURE': return 'Future'
    }
  }

  return (
    <div>
      <PageHeader 
        title="The Forecast" 
        subtitle="Predictive asset lifecycle and refresh management" 
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'The Forecast' }
        ]}
      />

      <div className="kpi-grid">
        <div className="kpi-card rose">
          <div className="kpi-icon rose">⚠️</div>
          <div className="kpi-label">Overdue Refresh Cost</div>
          <div className="kpi-value">{formatCurrency(stats.totalCostOverdue)}</div>
          <div className="kpi-sub">{stats.overdueCount} assets need immediate replacement</div>
        </div>
        
        <div className="kpi-card amber">
          <div className="kpi-icon amber">⏳</div>
          <div className="kpi-label">Current Q{stats.currentFQ} (FY{stats.currentFY.toString().slice(-2)}) Budget</div>
          <div className="kpi-value">{formatCurrency(stats.totalCostCurrentQ)}</div>
          <div className="kpi-sub">{stats.currentQCount} assets to refresh this quarter</div>
        </div>

        <div className="kpi-card violet">
          <div className="kpi-icon violet">🔮</div>
          <div className="kpi-label">Next Q{stats.nextFQ} (FY{stats.nextFY.toString().slice(-2)}) Budget</div>
          <div className="kpi-value">{formatCurrency(stats.totalCostNextQ)}</div>
          <div className="kpi-sub">{stats.nextQCount} assets to refresh next quarter</div>
        </div>

        <div className="kpi-card cyan">
          <div className="kpi-icon cyan">📈</div>
          <div className="kpi-label">Tracked Assets</div>
          <div className="kpi-value">{stats.totalTracked}</div>
          <div className="kpi-sub">Assets with purchase data</div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Asset Refresh Schedule (4-Year Lifecycle)</h2>
      </div>

      <ForecastKanban initialData={grouped} />
    </div>
  )
}
