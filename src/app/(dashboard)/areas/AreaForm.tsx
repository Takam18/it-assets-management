'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createArea, updateArea, deleteArea } from '@/actions/areas'
import type { Area } from '@prisma/client'

type AreaFormProps = {
  initialData?: Area | null
}

export function AreaForm({ initialData }: AreaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      building: form.get('building') as string,
      room: form.get('room') as string,
      location: form.get('location') as string,
      remark: form.get('remark') as string,
    }

    try {
      if (initialData) {
        await updateArea(initialData.id, data)
      } else {
        await createArea(data)
      }
      router.push('/areas')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initialData || !confirm('Are you sure you want to delete this area?')) return
    
    try {
      setLoading(true)
      await deleteArea(initialData.id)
      router.push('/areas')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete area')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="warranty-alert" style={{ marginBottom: 'var(--space-lg)' }}>
          <span className="warranty-alert-icon">⚠</span>
          <span className="warranty-alert-text">{error}</span>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="building">Building *</label>
          <input 
            id="building"
            name="building"
            className="form-input"
            required
            defaultValue={initialData?.building || ''}
            placeholder="e.g., Main HQ" 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="location">Area *</label>
          <input 
            id="location"
            name="location"
            className="form-input"
            required
            defaultValue={initialData?.location || ''}
            placeholder="e.g., 4th Floor North Wing" 
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="room">Room *</label>
          <input 
            id="room"
            name="room"
            className="form-input"
            required
            defaultValue={initialData?.room || ''}
            placeholder="e.g., 404" 
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="remark">Remark</label>
          <input 
            id="remark"
            name="remark"
            className="form-input"
            defaultValue={initialData?.remark || ''}
            placeholder="Any additional remarks" 
          />
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Area' : 'Create Area'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => router.push('/areas')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
        
        {isEditing && (
          <button 
            type="button" 
            className="btn"
            style={{ backgroundColor: 'var(--accent-rose)', color: 'white', borderColor: 'transparent' }}
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Area
          </button>
        )}
      </div>
    </form>
  )
}
