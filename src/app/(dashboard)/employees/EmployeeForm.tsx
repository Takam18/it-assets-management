'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee, updateEmployee } from '@/actions/employees'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { employeeStatusOptions } from '@/lib/validations'
import type { Employee, Department, Location } from '@prisma/client'
import type { EmployeeStatus } from '@/lib/types'

export function EmployeeForm({
  employee,
  departments,
  locations,
}: {
  employee?: Employee | null
  departments: Department[]
  locations: Location[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const data = {
      employeeId: (form.get('employeeId') as string) || null,
      firstName: form.get('firstName') as string,
      lastName: form.get('lastName') as string,
      email: form.get('email') as string,
      departmentId: form.get('departmentId') ? Number(form.get('departmentId')) : null,
      locationId: form.get('locationId') ? Number(form.get('locationId')) : null,
      status: ((form.get('status') as string) || 'Active') as EmployeeStatus,
    }

    try {
      if (employee) {
        await updateEmployee(employee.id, data)
      } else {
        await createEmployee(data)
      }
      router.push('/employees')
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
          <label className="form-label" htmlFor="firstName">First Name *</label>
          <input id="firstName" name="firstName" className="form-input" required defaultValue={employee?.firstName || ''} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="lastName">Last Name *</label>
          <input id="lastName" name="lastName" className="form-input" required defaultValue={employee?.lastName || ''} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="employeeId">Employee ID</label>
          <input id="employeeId" name="employeeId" className="form-input" defaultValue={employee?.employeeId || ''} placeholder="e.g. EMP-001" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email *</label>
          <input id="email" name="email" type="email" className="form-input" required defaultValue={employee?.email || ''} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="form-select" defaultValue={employee?.status || 'Active'}>
            {employeeStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="departmentId">Department</label>
          <select id="departmentId" name="departmentId" className="form-select" defaultValue={employee?.departmentId || ''}>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.departmentName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="locationId">Location</label>
          <select id="locationId" name="locationId" className="form-select" defaultValue={employee?.locationId || ''}>
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.siteName}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Saving...' : employee ? 'Update' : 'Create'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
