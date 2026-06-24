'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import type { AssetCategory } from '@prisma/client'

export function CategoryForm({ category, allCategories }: { category?: AssetCategory | null, allCategories: AssetCategory[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newParentName, setNewParentName] = useState('')
  const [addingParent, setAddingParent] = useState(false)
  const [parentError, setParentError] = useState('')

  const handleAddParent = async () => {
    if (!newParentName.trim()) return;
    setAddingParent(true);
    setParentError('');
    try {
      await createCategory({ categoryName: newParentName.trim(), description: '', parentId: null });
      setNewParentName('');
    } catch(err) {
      setParentError(err instanceof Error ? err.message : 'Error adding parent category');
    } finally {
      setAddingParent(false);
    }
  }

  const handleDeleteParent = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this parent category?')) return;
    try {
      const res = await deleteCategory(id);
      if (res?.error) {
        setParentError(res.error);
      }
    } catch(err) {
      setParentError(err instanceof Error ? err.message : 'Error removing parent category');
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const data = { 
      categoryName: form.get('categoryName') as string, 
      description: form.get('description') as string,
      parentId: form.get('parentId') ? Number(form.get('parentId')) : null 
    }
    try {
      if (category) { await updateCategory(category.id, data) } else { await createCategory(data) }
      router.push('/categories')
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="warranty-alert" style={{ marginBottom: 'var(--space-lg)' }}><span className="warranty-alert-icon">⚠</span><span className="warranty-alert-text">{error}</span></div>}
      <div className="form-group">
        <label className="form-label" htmlFor="categoryName">Category Name *</label>
        <input id="categoryName" name="categoryName" className="form-input" required defaultValue={category?.categoryName || ''} placeholder="e.g., Laptops, Monitors, Servers" />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-textarea" defaultValue={category?.description || ''} placeholder="Describe this category..." />
      </div>
      <div className="form-group">
        <label className="form-label">Parent Category</label>
        {parentError && <div style={{ color: 'var(--danger-color, red)', marginBottom: '8px', fontSize: '14px' }}>{parentError}</div>}
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '180px', padding: '12px 16px', background: 'var(--glass-bg)', border: '2px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, margin: 0 }}>
              <input type="radio" name="parentId" value="" defaultChecked={!category?.parentId} style={{ cursor: 'pointer' }} />
              <span style={{ fontWeight: 600 }}>None (Top-Level)</span>
            </label>
          </div>
          {allCategories.filter(c => c.parentId === null && c.id !== category?.id).map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '180px', padding: '12px 16px', background: 'var(--glass-bg)', border: '2px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, margin: 0 }}>
                <input type="radio" name="parentId" value={c.id} defaultChecked={category?.parentId === c.id} style={{ cursor: 'pointer' }} />
                <span style={{ fontWeight: 600 }}>{c.categoryName}</span>
              </label>
              <button 
                type="button" 
                onClick={() => handleDeleteParent(c.id)} 
                style={{ background: 'none', border: 'none', color: 'var(--danger-color, #ef4444)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                title="Remove parent category"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="New parent category name..." 
            value={newParentName}
            onChange={e => setNewParentName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddParent(); } }}
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-secondary" onClick={handleAddParent} disabled={addingParent}>
            {addingParent ? 'Adding...' : 'Add Parent'}
          </button>
        </div>
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Saving...' : category ? 'Update' : 'Create'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
