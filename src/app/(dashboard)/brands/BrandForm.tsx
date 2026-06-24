'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrand, updateBrand } from '@/actions/brands'
import type { Brand } from '@prisma/client'

export function BrandForm({ brand }: { brand?: Brand | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    
    try {
      if (brand) {
        await updateBrand(brand.id, formData)
      } else {
        await createBrand(formData)
      }
      router.push('/brands')
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
        <label className="form-label" htmlFor="brandName">Brand Name *</label>
        <input 
          id="brandName" 
          name="brandName" 
          className="form-input" 
          required 
          defaultValue={brand?.brandName || ''} 
          placeholder="e.g., Apple, Dell, Lenovo" 
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : brand ? 'Update' : 'Create'} Brand
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  )
}
