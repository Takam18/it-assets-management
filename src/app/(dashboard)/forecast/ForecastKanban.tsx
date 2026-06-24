'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, closestCorners, DragOverlay } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { updateAssetRefreshDate, GroupedForecast, ForecastAsset, setOrderInProgress, setFYBudget } from '@/actions/forecast'
import { useRouter } from 'next/navigation'

// Formatters copied from page
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

const getStatusBadgeClass = (status: string) => {
  switch(status) {
    case 'OVERDUE': return 'status-badge loststolen' // red
    case 'SOON': return 'status-badge assigned' // amber
    case 'UPCOMING': return 'status-badge inrepair' // violet
    default: return 'status-badge in-stock' // green
  }
}

// Helper to get target date
function getMiddleDateOfQuarter(fy: number, q: number) {
  const startYear = fy - 1
  if (q === 1) return new Date(startYear, 9, 15) // Oct 15
  if (q === 2) return new Date(fy, 0, 15) // Jan 15
  if (q === 3) return new Date(fy, 3, 15) // Apr 15
  return new Date(fy, 6, 15) // Jul 15
}

function DraggableCard({ asset }: { asset: ForecastAsset }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: asset.id,
    data: asset
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    padding: '0.5rem 0.75rem',
    cursor: 'grab',
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: `3px solid ${asset.status === 'OVERDUE' ? 'var(--accent-rose)' : asset.status === 'SOON' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}`,
    background: 'var(--glass-bg)',
    borderRadius: '4px',
    border: asset.orderInProgress ? '2px dashed var(--accent-cyan)' : '1px solid var(--glass-border)',
    transition: transform ? 'none' : 'box-shadow var(--transition-fast)',
    zIndex: isDragging ? 999 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
        {asset.computerName} {asset.orderInProgress && <span style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem' }}>[Ordering]</span>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          fontSize: '0.75rem', 
          color: asset.currentAgeYears > 5 ? '#ff3366' : 'var(--text-secondary)',
          fontWeight: asset.currentAgeYears > 5 ? 700 : 400
        }}>
          Age: {asset.currentAgeYears} yrs
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatCurrency(asset.replacementCost)}</span>
      </div>
    </div>
  )
}

function DroppableQuarter({ fy, qNum, qData, onOrder }: { fy: number, qNum: number, qData: any, onOrder: (assets: ForecastAsset[]) => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `quarter-${fy}-${qNum}`,
    data: { fy, qNum }
  })
  
  const assets = qData ? qData.assets : []
  const qTotalCost = qData ? qData.totalCost : 0

  return (
    <div 
      ref={setNodeRef}
      className="kanban-column" 
      style={{ 
        flex: '0 0 320px', 
        background: isOver ? 'var(--glass-bg-active)' : 'var(--glass-bg)', 
        border: `1px solid ${isOver ? 'var(--accent-cyan)' : 'var(--glass-border)'}`, 
        borderRadius: 'var(--radius-md)', 
        padding: '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        minHeight: '300px',
        transition: 'all var(--transition-fast)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Quarter {qNum}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{formatCurrency(qTotalCost)}</span>
          {assets.length > 0 && <button onClick={() => onOrder(assets)} style={{ background: 'var(--glass-bg-active)', border: '1px solid var(--accent-cyan)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem' }}>Order</button>}
        </div>
      </div>
      
      <div className="kanban-card-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {assets.length > 0 ? (
          assets.map((asset: ForecastAsset) => (
            <DraggableCard key={asset.id} asset={asset} />
          ))
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '2rem 0' }}>
            Drop assets here
          </div>
        )}
      </div>
    </div>
  )
}

export default function ForecastKanban({ initialData }: { initialData: GroupedForecast[] }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [activeTab, setActiveTab] = useState(initialData[0]?.fiscalYear || 0)
  const [activeAsset, setActiveAsset] = useState<ForecastAsset | null>(null)
  const [editingBudgetFY, setEditingBudgetFY] = useState<number | null>(null)
  const [budgetInput, setBudgetInput] = useState('')
  const [orderedFYTab, setOrderedFYTab] = useState<number | null>(null)
  const [orderedPage, setOrderedPage] = useState(1)
  const [orderedLimit, setOrderedLimit] = useState(10)
  const [isOrderingVisible, setIsOrderingVisible] = useState(true)
  const [isSummaryVisible, setIsSummaryVisible] = useState(true)

  const handleOrderQuarter = async (assets: ForecastAsset[]) => {
    const ids = assets.filter(a => !a.orderInProgress).map(a => a.id)
    if (ids.length === 0) return
    
    // optimistic update
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as GroupedForecast[]
      for (const fy of newData) {
        for (const q of fy.quarters) {
          for (const a of q.assets) {
            if (ids.includes(a.id)) a.orderInProgress = true
          }
        }
      }
      return newData
    })

    await setOrderInProgress(ids, true)
    router.refresh()
  }

  const handleSaveBudget = async (fy: number) => {
    const amount = parseFloat(budgetInput)
    if (isNaN(amount)) {
      setEditingBudgetFY(null)
      return
    }

    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as GroupedForecast[]
      const fyData = newData.find(f => f.fiscalYear === fy)
      if (fyData) fyData.budget = amount
      return newData
    })
    
    setEditingBudgetFY(null)
    await setFYBudget(fy, amount)
    router.refresh()
  }

  // Sync data when server prop changes
  useEffect(() => {
    setData(initialData)
    if (!initialData.find(fy => fy.fiscalYear === activeTab)) {
      setActiveTab(initialData[0]?.fiscalYear || 0)
    }
  }, [initialData])

  const handleDragStart = (event: any) => {
    setActiveAsset(event.active.data.current)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveAsset(null)
    const { active, over } = event
    
    if (!over) return

    const assetId = active.id as string
    const asset = active.data.current as ForecastAsset
    const targetData = over.data.current as { fy: number, qNum: number }

    if (asset.fiscalYear === targetData.fy && asset.fiscalQuarter === targetData.qNum) {
      return // Dropped in same column
    }

    // Optimistic UI Update
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as GroupedForecast[]
      
      // Remove from old
      let movedAsset: any = null
      for (const fy of newData) {
        for (const q of fy.quarters) {
          const idx = q.assets.findIndex(a => a.id === assetId)
          if (idx !== -1) {
            movedAsset = q.assets[idx]
            q.assets.splice(idx, 1)
            q.totalCost -= movedAsset.replacementCost
            fy.totalCost -= movedAsset.replacementCost
            break
          }
        }
      }

      if (!movedAsset) return prev

      // Add to new
      let targetFY = newData.find(f => f.fiscalYear === targetData.fy)
      if (!targetFY) {
        // Technically shouldn't happen since columns exist, but safe fallback
        return prev
      }

      let targetQ = targetFY.quarters.find(q => q.quarter === targetData.qNum)
      if (!targetQ) {
        targetQ = { quarter: targetData.qNum, assets: [], totalCost: 0 }
        targetFY.quarters.push(targetQ)
      }

      movedAsset.fiscalYear = targetData.fy
      movedAsset.fiscalQuarter = targetData.qNum
      targetQ.assets.push(movedAsset)
      targetQ.totalCost += movedAsset.replacementCost
      targetFY.totalCost += movedAsset.replacementCost

      return newData
    })

    // Server update
    const targetDate = getMiddleDateOfQuarter(targetData.fy, targetData.qNum)
    await updateAssetRefreshDate(assetId, targetDate)
    router.refresh()
  }

  if (data.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        No assets with purchase dates found to forecast.
      </div>
    )
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      
      {/* Tabs UI */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0', overflowX: 'auto' }}>
        {data.map(fy => (
          <button
            key={fy.fiscalYear}
            onClick={() => setActiveTab(fy.fiscalYear)}
            style={{ 
              background: activeTab === fy.fiscalYear ? 'var(--glass-bg-active)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === fy.fiscalYear ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: activeTab === fy.fiscalYear ? 'var(--text-primary)' : 'var(--text-secondary)' 
            }}>
              FY{fy.fiscalYear.toString().slice(-2)}
            </span>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: activeTab === fy.fiscalYear ? 'var(--accent-amber)' : 'var(--text-muted)' 
            }}>
              {formatCurrency(fy.totalCost)}
            </span>
          </button>
        ))}
      </div>

      {data.filter(fy => fy.fiscalYear === activeTab).map(fy => {
        const isOverBudget = fy.budget > 0 && fy.totalCost > fy.budget
        return (
        <div key={fy.fiscalYear} style={{ marginBottom: '3rem' }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '1.5rem', 
            borderBottom: '2px solid var(--glass-border)', 
            paddingBottom: '0.75rem'
          }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)', margin: 0 }}>
              FY{fy.fiscalYear.toString().slice(-2)} Budget Forecast
            </h2>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Allocated Budget</span>
                {editingBudgetFY === fy.fiscalYear ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      value={budgetInput} 
                      onChange={e => setBudgetInput(e.target.value)} 
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', width: '100px' }}
                    />
                    <button onClick={() => handleSaveBudget(fy.fiscalYear)} style={{ background: 'var(--accent-cyan)', border: 'none', borderRadius: '4px', color: '#000', cursor: 'pointer', padding: '2px 8px' }}>Save</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(fy.budget || 0)}</span>
                    <button onClick={() => { setEditingBudgetFY(fy.fiscalYear); setBudgetInput((fy.budget || 0).toString()) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✏️</button>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Projected Cost</span>
                <span style={{ fontSize: '1.1rem', color: isOverBudget ? 'var(--accent-rose)' : 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(fy.totalCost)}</span>
              </div>
            </div>
          </div>
          
          <div className="kanban-board" style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
            {[1, 2, 3, 4].map(qNum => {
              const q = fy.quarters.find(x => x.quarter === qNum)
              return <DroppableQuarter key={qNum} fy={fy.fiscalYear} qNum={qNum} qData={q} onOrder={handleOrderQuarter} />
            })}
          </div>
        </div>
      )})}

      <DragOverlay>
        {activeAsset ? (
          <div style={{
            padding: '1rem', 
            boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
            borderLeft: `3px solid ${activeAsset.status === 'OVERDUE' ? 'var(--accent-rose)' : activeAsset.status === 'SOON' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}`,
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--accent-cyan)',
            opacity: 0.9,
            transform: 'scale(1.05)'
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {activeAsset.computerName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Age: {activeAsset.currentAgeYears} yrs</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatCurrency(activeAsset.replacementCost)}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Ordering Progress Table */}
      {(() => {
        const orderedAssets = data.flatMap(fy => fy.quarters.flatMap(q => q.assets)).filter(a => a.orderInProgress)
        if (orderedAssets.length === 0) return null
        
        const orderedFYs = Array.from(new Set(orderedAssets.map(a => a.fiscalYear))).sort((a, b) => a - b)
        const currentTab = orderedFYTab && orderedFYs.includes(orderedFYTab) ? orderedFYTab : orderedFYs[0]
        
        const filteredAssets = orderedAssets.filter(a => a.fiscalYear === currentTab)
        const totalPages = Math.max(1, Math.ceil(filteredAssets.length / orderedLimit))
        
        // Ensure page is within bounds
        const currentPage = Math.min(orderedPage, totalPages)
        const paginatedAssets = filteredAssets.slice((currentPage - 1) * orderedLimit, currentPage * orderedLimit)
        
        return (
          <div style={{ marginTop: '3rem', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOrderingVisible ? '1rem' : 0, cursor: 'pointer' }}
              onClick={() => setIsOrderingVisible(!isOrderingVisible)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>
                  {isOrderingVisible ? '▼' : '▶'}
                </button>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>Assets in Ordering Progress</h2>
              </div>
              
              {isOrderingVisible && (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rows per page:</span>
                  <select 
                    value={orderedLimit} 
                    onChange={e => { setOrderedLimit(Number(e.target.value)); setOrderedPage(1); }}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>
            
            {isOrderingVisible && (
              <>
                {/* FY Tabs for Ordered Assets */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              {orderedFYs.map(fy => (
                <button
                  key={fy}
                  onClick={() => { setOrderedFYTab(fy); setOrderedPage(1); }}
                  style={{
                    background: currentTab === fy ? 'var(--glass-bg-active)' : 'transparent',
                    border: 'none',
                    borderBottom: currentTab === fy ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    color: currentTab === fy ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: 600
                  }}
                >
                  FY{fy.toString().slice(-2)}
                </button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>Asset ID</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Target FY/Q</th>
                    <th style={{ padding: '0.75rem' }}>Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.length > 0 ? paginatedAssets.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{a.computerName}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{a.categoryName}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>FY{a.fiscalYear.toString().slice(-2)} Q{a.fiscalQuarter}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--accent-amber)' }}>{formatCurrency(a.replacementCost)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No assets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Showing {(currentPage - 1) * orderedLimit + 1} to {Math.min(currentPage * orderedLimit, filteredAssets.length)} of {filteredAssets.length} assets
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setOrderedPage(p => Math.max(1, p - 1))}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', padding: '4px 12px', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Prev
                  </button>
                  <span style={{ padding: '4px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setOrderedPage(p => Math.min(totalPages, p + 1))}
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', padding: '4px 12px', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
            )}
          </div>
        )
      })()}

      {/* Budget vs Expense Summary Table */}
      <div style={{ marginTop: '3rem', background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isSummaryVisible ? '1rem' : 0, cursor: 'pointer' }}
          onClick={() => setIsSummaryVisible(!isSummaryVisible)}
        >
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}>
            {isSummaryVisible ? '▼' : '▶'}
          </button>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>FY Budget vs Expense Summary</h2>
        </div>
        
        {isSummaryVisible && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Fiscal Year</th>
                <th style={{ padding: '0.75rem' }}>Allocated Budget</th>
                <th style={{ padding: '0.75rem' }}>Projected Expense</th>
                <th style={{ padding: '0.75rem' }}>Remaining / (Over) Budget</th>
              </tr>
            </thead>
            <tbody>
              {data.map(fy => {
                const spending = (fy.budget || 0) - fy.totalCost
                const isOver = spending < 0
                return (
                  <tr key={fy.fiscalYear} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>FY{fy.fiscalYear.toString().slice(-2)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{formatCurrency(fy.budget || 0)}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{formatCurrency(fy.totalCost)}</td>
                    <td style={{ padding: '0.75rem', color: isOver ? 'var(--accent-rose)' : 'var(--accent-cyan)', fontWeight: 600 }}>
                      {isOver ? `(${formatCurrency(Math.abs(spending))})` : formatCurrency(spending)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

    </DndContext>
  )
}
