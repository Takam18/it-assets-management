'use client'

import { useState } from 'react'
import { createPurchaseOrder, createPurchaseSchedule } from '@/actions/procure'

export default function ProcurementDashboard({ forecastAssets, purchaseOrders, vendors, categories }: any) {
  const [activeTab, setActiveTab] = useState<'FORECAST' | 'ORDERS' | 'SCHEDULES'>('FORECAST')

  // Forecast aggregation: group by category and vendor
  const forecastSummary = forecastAssets.reduce((acc: any, asset: any) => {
    const key = `${asset.category?.categoryName || 'Unknown'} - ${asset.vendor?.vendorName || 'Unknown'}`
    if (!acc[key]) {
      acc[key] = {
        categoryName: asset.category?.categoryName || 'Unknown',
        vendorName: asset.vendor?.vendorName || 'Unknown',
        count: 0,
        estimatedTotalCost: 0
      }
    }
    acc[key].count += 1
    acc[key].estimatedTotalCost += (asset.replacementCost || 0)
    return acc
  }, {})

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  async function handleCreatePO(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createPurchaseOrder(formData)
    e.currentTarget.reset()
  }

  async function handleCreateSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createPurchaseSchedule(formData)
    e.currentTarget.reset()
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('FORECAST')}
          style={{ background: activeTab === 'FORECAST' ? 'var(--glass-bg-active)' : 'transparent', border: 'none', borderBottom: activeTab === 'FORECAST' ? '2px solid var(--accent-cyan)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', color: activeTab === 'FORECAST' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
        >
          Forecasts & Leverage
        </button>
        <button
          onClick={() => setActiveTab('ORDERS')}
          style={{ background: activeTab === 'ORDERS' ? 'var(--glass-bg-active)' : 'transparent', border: 'none', borderBottom: activeTab === 'ORDERS' ? '2px solid var(--accent-cyan)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', color: activeTab === 'ORDERS' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
        >
          Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULES')}
          style={{ background: activeTab === 'SCHEDULES' ? 'var(--glass-bg-active)' : 'transparent', border: 'none', borderBottom: activeTab === 'SCHEDULES' ? '2px solid var(--accent-cyan)' : '2px solid transparent', padding: '0.5rem 1rem', cursor: 'pointer', color: activeTab === 'SCHEDULES' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}
        >
          Delivery Schedules
        </button>
      </div>

      {activeTab === 'FORECAST' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Bulk Purchase Opportunities</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Aggregated view of assets requested for ordering. Use this data to negotiate blanket POs and volume discounts.
          </p>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Preferred Vendor</th>
                  <th>Requested Quantity</th>
                  <th>Estimated Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(forecastSummary).map((item: any, idx) => (
                  <tr key={idx}>
                    <td>{item.categoryName}</td>
                    <td>{item.vendorName}</td>
                    <td><span className="status-badge assigned">{item.count} units</span></td>
                    <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{formatCurrency(item.estimatedTotalCost)}</td>
                  </tr>
                ))}
                {Object.keys(forecastSummary).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No pending orders forecasted.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Active Purchase Orders</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Vendor</th>
                    <th>Type</th>
                    <th>Total / Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po: any) => (
                    <tr key={po.id}>
                      <td style={{ fontWeight: 600 }}>{po.poNumber}</td>
                      <td>{po.vendor?.vendorName}</td>
                      <td>
                        <span className={`status-badge ${po.type === 'BLANKET' ? 'inrepair' : 'available'}`}>
                          {po.type}
                        </span>
                      </td>
                      <td>
                        {formatCurrency(po.totalAmount)}
                        {po.type === 'BLANKET' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            Rem: {formatCurrency(po.remainingAmount || 0)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {purchaseOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No purchase orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Create PO</h3>
            <form onSubmit={handleCreatePO} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>PO Number</label>
                <input type="text" name="poNumber" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Vendor</label>
                <select name="vendorId" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}>
                  {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.vendorName}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>PO Type</label>
                <select name="type" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}>
                  <option value="BLANKET">Blanket PO</option>
                  <option value="STANDARD">Standard PO</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Total Amount ($)</label>
                <input type="number" step="0.01" name="totalAmount" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create Order</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'SCHEDULES' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Delivery Schedules</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Expected</th>
                    <th>Delivery Type</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.flatMap((po: any) => 
                    po.schedules.map((sch: any) => (
                      <tr key={sch.id}>
                        <td style={{ fontWeight: 600 }}>{po.poNumber}</td>
                        <td>{sch.category?.categoryName}</td>
                        <td>{sch.quantity}</td>
                        <td>{new Date(sch.expectedDelivery).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${sch.deliveryType === 'JUST_IN_TIME' ? 'in-stock' : 'assigned'}`}>
                            {sch.deliveryType.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                  {purchaseOrders.every((po: any) => po.schedules.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No delivery schedules found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Schedule Delivery</h3>
            <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Purchase Order</label>
                <select name="purchaseOrderId" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}>
                  {purchaseOrders.map((po: any) => <option key={po.id} value={po.id}>{po.poNumber} ({po.type})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Category</label>
                <select name="assetCategoryId" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Quantity</label>
                  <input type="number" name="quantity" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Est. Cost ($)</label>
                  <input type="number" step="0.01" name="estimatedCost" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Expected Delivery</label>
                <input type="date" name="expectedDelivery" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Delivery Type</label>
                <select name="deliveryType" required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '4px' }}>
                  <option value="JUST_IN_TIME">Just-In-Time (JIT)</option>
                  <option value="SUPPLIER_WAREHOUSE">Supplier Warehouse</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Schedule</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
