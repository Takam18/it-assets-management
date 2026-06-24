'use client'

import { useState } from 'react'

type CategoryData = {
  id: number;
  categoryName: string;
  parentId: number | null;
  _count: { assets: number };
}

export function CategoryBreakdownChart({ data }: { data: CategoryData[] }) {
  const [expandedParents, setExpandedParents] = useState<number[]>([])

  const toggleParent = (id: number) => {
    setExpandedParents(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const parents = data.filter(c => c.parentId === null)
  
  // Calculate total assets for a parent (parent's own assets + children's assets)
  const getParentTotal = (parentId: number) => {
    const parentAssets = data.find(c => c.id === parentId)?._count.assets || 0
    const childrenAssets = data.filter(c => c.parentId === parentId).reduce((sum, c) => sum + c._count.assets, 0)
    return parentAssets + childrenAssets
  }

  // To find max for the bar scaling
  const maxAssets = Math.max(
    ...parents.map(p => getParentTotal(p.id)),
    1
  )

  const barColors = ['cyan', 'emerald', 'amber', 'violet', 'rose'] as const

  return (
    <div className="bar-chart">
      {parents.map((parent, i) => {
        const total = getParentTotal(parent.id)
        const children = data.filter(c => c.parentId === parent.id)
        const isExpanded = expandedParents.includes(parent.id)
        const colorClass = barColors[i % barColors.length]

        return (
          <div key={parent.id} style={{ marginBottom: '12px' }}>
            {/* Parent Bar */}
            <div 
              className="bar-item" 
              style={{ cursor: children.length > 0 ? 'pointer' : 'default', marginBottom: isExpanded ? '8px' : '0' }}
              onClick={() => children.length > 0 && toggleParent(parent.id)}
            >
              <span className="bar-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: '12px', 
                  fontSize: '10px', 
                  transform: isExpanded ? 'rotate(90deg)' : 'none', 
                  transition: 'transform 0.1s ease',
                  opacity: children.length > 0 ? 1 : 0 
                }}>
                  ▶
                </span>
                {parent.categoryName}
              </span>
              <div className="bar-track">
                <div
                  className={`bar-fill ${colorClass}`}
                  style={{ width: `${(total / maxAssets) * 100}%` }}
                >
                  {total}
                </div>
              </div>
            </div>

            {/* Children Bars */}
            {isExpanded && (
              <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '2px solid var(--glass-border)', marginLeft: '6px', marginTop: '8px' }}>
                {/* Parent's OWN assets (if any) */}
                {parent._count.assets > 0 && (
                  <div className="bar-item" style={{ marginBottom: 0 }}>
                    <span className="bar-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(General)</span>
                    <div className="bar-track" style={{ height: '16px' }}>
                      <div className={`bar-fill ${colorClass}`} style={{ width: `${(parent._count.assets / maxAssets) * 100}%`, opacity: 0.6 }}>
                        {parent._count.assets}
                      </div>
                    </div>
                  </div>
                )}
                {/* Children */}
                {children.map(child => (
                  <div key={child.id} className="bar-item" style={{ marginBottom: 0 }}>
                    <span className="bar-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{child.categoryName}</span>
                    <div className="bar-track" style={{ height: '16px' }}>
                      <div className={`bar-fill ${colorClass}`} style={{ width: `${(child._count.assets / maxAssets) * 100}%`, opacity: 0.6 }}>
                        {child._count.assets}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {parents.length === 0 && (
        <p className="text-muted text-sm">No categories yet</p>
      )}
    </div>
  )
}
