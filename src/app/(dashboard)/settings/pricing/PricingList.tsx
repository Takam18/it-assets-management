'use client'

import { useState, useTransition } from 'react'
import type { AssetCategory } from '@prisma/client'
import { updateCategoryPrice } from '@/actions/categories'

export function PricingList({ categories }: { categories: AssetCategory[] }) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const handleSave = (id: number) => {
    setError(null)
    const val = parseFloat(editValue)
    const newPrice = isNaN(val) ? null : val

    startTransition(async () => {
      try {
        const result = await updateCategoryPrice(id, newPrice)
        if (result?.error) {
          setError(result.error)
        } else {
          setEditingId(null)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to update price')
      }
    })
  }

  return (
    <div className="glass-card animate-in">
      {error && (
        <div className="warranty-alert" style={{ marginBottom: 'var(--space-md)' }}>
          <span className="warranty-alert-icon">⚠</span>
          <span className="warranty-alert-text">{error}</span>
        </div>
      )}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Description</th>
              <th>Default Reference Price</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td><strong>{cat.categoryName}</strong></td>
                <td style={{ color: 'var(--text-muted)' }}>{cat.description || '—'}</td>
                <td className="font-mono">
                  {editingId === cat.id ? (
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-input" 
                        style={{ paddingLeft: '24px', margin: 0 }}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(cat.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                    </div>
                  ) : (
                    cat.defaultPrice != null ? `$${cat.defaultPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
                  )}
                </td>
                <td style={{ textAlign: 'right', width: '150px' }}>
                  {editingId === cat.id ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleSave(cat.id)}
                        disabled={isPending}
                      >
                        {isPending ? 'Saving' : 'Save'}
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => setEditingId(null)}
                        disabled={isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditingId(cat.id)
                        setEditValue(cat.defaultPrice?.toString() || '')
                      }}
                      disabled={isPending}
                    >
                      ✏️ Set Price
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
