'use client'

import { useState } from 'react'
import { PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'

type User = {
  id: number
  email: string
  ntid: string | null
  name: string | null
  role: string
}

export function UserEditModal({ 
  user, 
  updateAction 
}: { 
  user: User
  updateAction: (formData: FormData) => Promise<void> 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await updateAction(formData)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        className="btn btn-secondary btn-sm" 
        onClick={() => setIsOpen(true)}
        title="Edit User"
      >
        <PencilIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal" style={{ maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Edit User</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)} title="Close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="hidden" name="id" value={user.id} />
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" required defaultValue={user.name || ''} />
              </div>
              <div className="form-group">
                <label className="form-label">NTID (Optional)</label>
                <input type="text" name="ntid" className="form-input" defaultValue={user.ntid || ''} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" required defaultValue={user.email} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select name="role" className="form-select" defaultValue={user.role}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Change Password (Optional)</label>
                <input type="password" name="password" className="form-input" placeholder="Leave blank to keep current" />
              </div>
              
              <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)} style={{ flex: 1 }} title="Cancel">
                  <XMarkIcon className="w-5 h-5" />
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }} title="Save">
                  {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
