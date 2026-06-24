'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLocation, updateLocation } from '@/actions/locations'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Location } from '@prisma/client'

export function LocationForm({ location }: { location?: Location | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const data = { siteName: form.get('siteName') as string, address: form.get('address') as string, city: form.get('city') as string, country: form.get('country') as string }
    try {
      if (location) { await updateLocation(location.id, data) } else { await createLocation(data) }
      router.push('/locations')
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="warranty-alert" style={{ marginBottom: 'var(--space-lg)' }}><span className="warranty-alert-icon">⚠</span><span className="warranty-alert-text">{error}</span></div>}
      <div className="form-group">
        <label className="form-label" htmlFor="siteName">Site Name *</label>
        <input id="siteName" name="siteName" className="form-input" required defaultValue={location?.siteName || ''} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="address">Address</label>
        <input id="address" name="address" className="form-input" defaultValue={location?.address || ''} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="city">City</label>
          <input id="city" name="city" className="form-input" defaultValue={location?.city || ''} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="country">Country</label>
          <input id="country" name="country" className="form-input" defaultValue={location?.country || ''} />
        </div>
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Saving...' : location ? 'Update' : 'Create'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
