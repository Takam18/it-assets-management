'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVendor, updateVendor } from '@/actions/vendors'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Vendor } from '@prisma/client'

export function VendorForm({ vendor }: { vendor?: Vendor | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const data = {
      vendorName: form.get('vendorName') as string,
      contactName: form.get('contactName') as string,
      contactEmail: form.get('contactEmail') as string,
      supportPhone: form.get('supportPhone') as string,
    }
    try {
      if (vendor) { await updateVendor(vendor.id, data) } else { await createVendor(data) }
      router.push('/vendors')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="warranty-alert" style={{ marginBottom: 'var(--space-lg)' }}><span className="warranty-alert-icon">⚠</span><span className="warranty-alert-text">{error}</span></div>}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="vendorName">Vendor Name *</label>
          <input id="vendorName" name="vendorName" className="form-input" required defaultValue={vendor?.vendorName || ''} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="contactName">Contact Name</label>
          <input id="contactName" name="contactName" className="form-input" defaultValue={vendor?.contactName || ''} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="contactEmail">Contact Email</label>
          <input id="contactEmail" name="contactEmail" type="email" className="form-input" defaultValue={vendor?.contactEmail || ''} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="supportPhone">Support Phone</label>
          <input id="supportPhone" name="supportPhone" className="form-input" defaultValue={vendor?.supportPhone || ''} />
        </div>
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Saving...' : vendor ? 'Update' : 'Create'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
