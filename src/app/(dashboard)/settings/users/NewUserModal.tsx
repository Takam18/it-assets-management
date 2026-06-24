'use client'

import { useState } from 'react'

export function NewUserModal({ createAction }: { createAction: (formData: FormData) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await createAction(formData)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        + Add New User
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass-card animate-in" onClick={e => e.stopPropagation()} style={{ width: '400px', maxWidth: '90%' }}>
            <div className="glass-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="glass-card-title">Add New User</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" required placeholder="Jane Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">NTID (Optional)</label>
                <input type="text" name="ntid" className="form-input" placeholder="e.g. jdoe123" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" required placeholder="jane@company.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-input" required placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select name="role" className="form-select" required defaultValue="USER">
                  <option value="USER">Standard User (USER)</option>
                  <option value="ADMIN">Administrator (ADMIN)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
