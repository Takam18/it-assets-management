'use client'

import { useState } from 'react'
import { toggleAssetLabel } from '@/actions/assets'

export function ToggleAssetLabel({ assetId, initialStatus }: { assetId: string, initialStatus: boolean }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(initialStatus)

  const handleToggle = async () => {
    setLoading(true)
    const newStatus = !status
    setStatus(newStatus) // Optimistic update
    try {
      await toggleAssetLabel(assetId, newStatus)
    } catch (e) {
      setStatus(!newStatus) // Revert on failure
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`btn btn-sm ${status ? 'btn-primary' : 'btn-secondary'}`}
      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
    >
      {status ? '✓ Labeled' : '☐ Untracked'}
    </button>
  )
}
