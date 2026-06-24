'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDepartment, updateDepartment } from '@/actions/departments'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Department } from '@prisma/client'

export function DepartmentForm({ department }: { department?: Department | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const data = { departmentName: form.get('departmentName') as string }
    try {
      if (department) { await updateDepartment(department.id, data) } else { await createDepartment(data) }
      router.push('/departments')
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="warranty-alert" style={{ marginBottom: 'var(--space-lg)' }}><span className="warranty-alert-icon">⚠</span><span className="warranty-alert-text">{error}</span></div>}
      <div className="form-group">
        <label className="form-label" htmlFor="departmentName">Department Name *</label>
        <input id="departmentName" name="departmentName" className="form-input" required defaultValue={department?.departmentName || ''} />
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Saving...' : department ? 'Update' : 'Create'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
