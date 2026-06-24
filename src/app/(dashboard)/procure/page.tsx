import { getProcurementForecast, getPurchaseOrders } from '@/actions/procure'
import { getVendors } from '@/actions/vendors'
import { getCategories } from '@/actions/categories'
import ProcurementDashboard from './ProcurementDashboard'

export default async function ProcurePage() {
  const [forecastRes, poRes, vendorsRes, categoriesRes] = await Promise.all([
    getProcurementForecast(),
    getPurchaseOrders(),
    getVendors(),
    getCategories()
  ])

  // Extract data with fallback for empty arrays in case of schema cache errors
  const forecastData = forecastRes.assets || []
  const poData = poRes.pos || []
  const vendorsData = vendorsRes.vendors || []
  const categoriesData = categoriesRes.categories || []
  const note = poRes.note || forecastRes.note || null

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="breadcrumb">
              <span>Overview</span>
              <span className="breadcrumb-sep">/</span>
              <span>Procure</span>
            </div>
            <h1 className="page-title">Procurement & Sourcing</h1>
            <p className="page-subtitle">Manage supplier negotiations, blanket POs, and dynamic delivery schedules.</p>
          </div>
        </div>
      </div>

      {note && (
        <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid var(--accent-rose)', color: 'var(--accent-rose)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <strong>Note:</strong> {note}
        </div>
      )}

      <ProcurementDashboard 
        forecastAssets={forecastData}
        purchaseOrders={poData}
        vendors={vendorsData}
        categories={categoriesData}
      />
    </div>
  )
}
