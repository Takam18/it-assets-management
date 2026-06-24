'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMaintenanceLog } from '@/actions/maintenance'
import { serviceTypeOptions } from '@/lib/validations'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Asset, Vendor } from '@prisma/client'

export function MaintenanceForm({
  assets,
  vendors,
  defaultAssetId,
}: {
  assets: Asset[]
  vendors: Vendor[]
  defaultAssetId?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      await createMaintenanceLog({
        assetId: form.get('assetId') as string,
        serviceDate: form.get('serviceDate') as string,
        serviceType: form.get('serviceType') as 'Repair' | 'Upgrade' | 'RoutineMaintenance' | 'Audit',
        vendorId: form.get('vendorId') ? Number(form.get('vendorId')) : null,
        cost: form.get('cost') ? Number(form.get('cost')) : null,
        description: form.get('description') as string,
        performedBy: form.get('performedBy') as string,
      })
      router.push('/maintenance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="warranty-alert" style={{ marginBottom: 'var(--space-lg)' }}>
          <span className="warranty-alert-icon">⚠</span>
          <span className="warranty-alert-text">{error}</span>
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="assetId">Asset *</label>
          <select id="assetId" name="assetId" className="form-select" required defaultValue={defaultAssetId || ''}>
            <option value="">Select asset</option>
            {assets.map((a) => (
              <option key={a.computerName} value={a.computerName}>{a.computerName} — {a.model || 'Unknown'}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="serviceType">Service Type *</label>
          <select id="serviceType" name="serviceType" className="form-select" required>
            {serviceTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="serviceDate">Service Date *</label>
          <input id="serviceDate" name="serviceDate" type="date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="cost">Cost ($)</label>
          <input id="cost" name="cost" type="number" step="0.01" min="0" className="form-input" placeholder="0.00" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="vendorId">Service Vendor</label>
          <select id="vendorId" name="vendorId" className="form-select">
            <option value="">In-house / Select vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.vendorName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="performedBy">Performed By</label>
          <input id="performedBy" name="performedBy" className="form-input" placeholder="Tech name" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-textarea" placeholder="Describe the work performed..." />
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Saving...' : 'Create Log'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
