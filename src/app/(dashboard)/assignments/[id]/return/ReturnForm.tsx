'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { returnAsset } from '@/actions/assignments'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export function ReturnForm({ assignmentId }: { assignmentId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      await returnAsset(assignmentId, {
        actualReturnDate: form.get('actualReturnDate') as string,
        checkInCondition: form.get('checkInCondition') as string,
      })
      router.push('/assignments')
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
      <div className="form-group">
        <label className="form-label" htmlFor="actualReturnDate">Return Date *</label>
        <input id="actualReturnDate" name="actualReturnDate" type="date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="checkInCondition">Check-In Condition</label>
        <textarea id="checkInCondition" name="checkInCondition" className="form-textarea" placeholder="Describe the asset condition upon return..." />
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Processing...' : 'Return Asset'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
