'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAsset } from '@/actions/assets'

export function AssetDeleteButton({ id, tag }: { id: string; tag: string }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteAsset(id)
      router.push('/assets')
    } catch {
      setLoading(false)
      setShowModal(false)
    }
  }

  return (
    <>
      <button className="btn btn-danger btn-sm" onClick={() => setShowModal(true)}>
        🗑️ Delete
      </button>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Asset</h3>
            <p className="modal-body">
              Are you sure you want to delete asset <strong>{tag}</strong>? This action cannot be undone.
              All assignment and maintenance history will also be removed.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
