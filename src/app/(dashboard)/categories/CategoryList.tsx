'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { deleteCategory, deleteCategories } from '@/actions/categories'
import { useRouter } from 'next/navigation'

type CategoryWithRelations = Prisma.AssetCategoryGetPayload<{
  include: {
    parent: true
    _count: { select: { assets: true } }
  }
}>

export function CategoryList({ categories }: { categories: CategoryWithRelations[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(categories.map(c => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setSelectedIds(prev => prev.filter(x => x !== id))
      }
    })
  }

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteCategories(selectedIds)
      if (result?.error) {
        setError(result.error)
      } else {
        setSelectedIds([])
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 animate-in">
      {error && (
        <div className="warranty-alert" style={{ marginBottom: 0 }}>
          <span className="warranty-alert-icon">⚠</span>
          <span className="warranty-alert-text">{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>{selectedIds.length} categor{selectedIds.length === 1 ? 'y' : 'ies'} selected</span>
          <button 
            className="btn" 
            style={{ backgroundColor: 'var(--accent-rose)', color: '#fff', border: 'none' }}
            onClick={handleBulkDelete}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={categories.length > 0 && selectedIds.length === categories.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Assets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleSelect(c.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    {c.parent && <span className="text-muted text-sm mr-2">{c.parent.categoryName} &gt; </span>}
                    <strong>{c.categoryName}</strong>
                  </td>
                  <td className="text-sm truncate" style={{ maxWidth: '300px' }}>{c.description || <span className="text-muted">—</span>}</td>
                  <td>{c._count.assets}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/categories/${c.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleDelete(c.id)}
                        disabled={isPending}
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
