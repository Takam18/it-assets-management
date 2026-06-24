'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAssignment } from '@/actions/assignments'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Asset, Employee } from '@prisma/client'

export function AssignmentForm({
  assets,
  employees,
  defaultAssetId,
}: {
  assets: Asset[]
  employees: Employee[]
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
      await createAssignment({
        assetId: form.get('assetId') as string,
        employeeId: Number(form.get('employeeId')),
        assignedDate: form.get('assignedDate') as string,
        expectedReturnDate: form.get('expectedReturnDate') as string,
        checkOutCondition: form.get('checkOutCondition') as string,
        assignedBy: form.get('assignedBy') as string,
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
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="assetId">Asset *</label>
          <select id="assetId" name="assetId" className="form-select" required defaultValue={defaultAssetId || ''}>
            <option value="">Select in stock asset</option>
            {assets.map((a) => {
              const isAvailable = a.status === 'In Stock' || a.status.toLowerCase() === 'in stock';
              return (
                <option key={a.computerName} value={a.computerName} disabled={!isAvailable}>
                  {a.computerName} — {a.model || 'Unknown'} {!isAvailable ? `(${a.status})` : ''}
                </option>
              )
            })}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="employeeId">Employee *</label>
          <select id="employeeId" name="employeeId" className="form-select" required>
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.email})</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="assignedDate">Assigned Date *</label>
          <input id="assignedDate" name="assignedDate" type="date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="expectedReturnDate">Expected Return Date</label>
          <input id="expectedReturnDate" name="expectedReturnDate" type="date" className="form-input" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="assignedBy">Assigned By</label>
          <input id="assignedBy" name="assignedBy" className="form-input" placeholder="IT staff member name" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="checkOutCondition">Check-Out Condition</label>
        <textarea id="checkOutCondition" name="checkOutCondition" className="form-textarea" placeholder="Describe the asset condition at time of assignment..." />
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Assigning...' : 'Assign Asset'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
