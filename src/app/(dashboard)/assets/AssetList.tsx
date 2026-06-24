'use client'

import { useState, useMemo, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui'
import { ToggleAssetLabel } from './ToggleAssetLabel'
import { Prisma } from '@prisma/client'
import Papa from 'papaparse'
import { deleteAsset, deleteAssets, importAssetsCsv } from '@/actions/assets'
import { useRouter } from 'next/navigation'

type AssetWithRelations = Prisma.AssetGetPayload<{
  include: {
    category: true
    vendor: true
    location: true
    brand: true
  }
}>

type AssetListProps = {
  assets: AssetWithRelations[]
  search?: string
  status?: string
}

export function AssetList({ assets, search, status }: AssetListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeTab, setActiveTab] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Category tabs ordering
  const [orderedCategories, setOrderedCategories] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)

  // Extract unique categories and apply saved order
  const categories = useMemo(() => {
    const cats = new Set(assets.map(a => a.category?.categoryName).filter(Boolean) as string[])
    const defaultOrder = ['All', ...Array.from(cats)].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b))
    
    if (orderedCategories.length > 0) {
      const newCats = defaultOrder.filter(c => !orderedCategories.includes(c))
      const validOrdered = orderedCategories.filter(c => defaultOrder.includes(c))
      return [...validOrdered, ...newCats]
    }
    return defaultOrder
  }, [assets, orderedCategories])

  // Load saved order on mount
  useEffect(() => {
    const saved = localStorage.getItem('categoryTabOrder')
    if (saved) {
      try {
        setOrderedCategories(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const handleDragStart = (e: React.DragEvent, tab: string) => {
    if (tab === 'All') return
    setDraggedItem(tab)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', tab)
  }

  const handleDragEnter = (e: React.DragEvent, tab: string) => {
    e.preventDefault()
    if (tab === 'All' || tab === draggedItem) return
    setDragOverItem(tab)
  }

  const handleDragOver = (e: React.DragEvent, tab: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetTab: string) => {
    e.preventDefault()
    if (!draggedItem || targetTab === 'All' || draggedItem === targetTab) {
      handleDragEnd()
      return
    }

    const currentOrder = [...categories]
    const draggedIdx = currentOrder.indexOf(draggedItem)
    const targetIdx = currentOrder.indexOf(targetTab)

    currentOrder.splice(draggedIdx, 1)
    currentOrder.splice(targetIdx, 0, draggedItem)

    setOrderedCategories(currentOrder)
    localStorage.setItem('categoryTabOrder', JSON.stringify(currentOrder))
    handleDragEnd()
  }

  // Table horizontal drag handlers
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const isDraggingTable = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingTable.current || !tableContainerRef.current) return
      if ((e.buttons & 1) !== 1) {
        isDraggingTable.current = false
        tableContainerRef.current.style.cursor = 'auto'
        return
      }
      e.preventDefault()
      const x = e.pageX - tableContainerRef.current.offsetLeft
      const walk = (x - startX.current) * 1.5
      tableContainerRef.current.scrollLeft = scrollLeft.current - walk
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingTable.current = false
        if (tableContainerRef.current) {
          tableContainerRef.current.style.cursor = 'auto'
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleTableMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !tableContainerRef.current) return
    isDraggingTable.current = true
    startX.current = e.pageX - tableContainerRef.current.offsetLeft
    scrollLeft.current = tableContainerRef.current.scrollLeft
    tableContainerRef.current.style.cursor = 'grabbing'
  }

  // Filter by category
  const filteredAssets = useMemo(() => {
    if (activeTab === 'All') return assets
    return assets.filter(a => a.category?.categoryName === activeTab)
  }, [assets, activeTab])

  // Pagination logic
  const itemsPerPage = viewMode === 'table' ? 25 : 10
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)

  const calculateAge = (startDate: Date | string | null | undefined) => {
    if (!startDate) return { text: '—', years: -1 }
    const start = new Date(startDate)
    const now = new Date()

    let years = now.getFullYear() - start.getFullYear()
    let months = now.getMonth() - start.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    if (years < 0) return { text: '0y0m', years: 0 }

    return { text: `${years}y${months}m`, years }
  }

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAssets.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAssets, currentPage, itemsPerPage])

  // Reset page when tab or view changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'table' ? 'cards' : 'table')
    setCurrentPage(1)
  }

  // Selection & Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAssets.map(a => a.computerName))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      const result = await deleteAsset(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccessMessage('Asset deleted successfully.')
        setSelectedIds(prev => prev.filter(x => x !== id))
      }
    })
  }

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} assets?`)) return
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      const result = await deleteAssets(selectedIds)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccessMessage(`${selectedIds.length} assets deleted successfully.`)
        setSelectedIds([])
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccessMessage(null)
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        startTransition(async () => {
          const res = await importAssetsCsv(results.data)
          if (res?.error) {
            setError(res.error)
          } else {
            setSuccessMessage(`Successfully imported ${res.count} new assets (duplicates skipped).`)
          }
          if (fileInputRef.current) fileInputRef.current.value = ''
        })
      },
      error: (err) => {
        setError('Failed to parse CSV file: ' + err.message)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Alert Messages */}
      {error && (
        <div className="warranty-alert" style={{ marginBottom: 0 }}>
          <span className="warranty-alert-icon">⚠</span>
          <span className="warranty-alert-text">{error}</span>
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {successMessage && (
        <div className="warranty-alert" style={{ marginBottom: 0, backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
          <span className="warranty-alert-icon">✓</span>
          <span className="warranty-alert-text">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {selectedIds.length > 0 ? (
            <>
              <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>{selectedIds.length} asset{selectedIds.length === 1 ? '' : 's'} selected</span>
              <button 
                className="btn btn-sm" 
                style={{ backgroundColor: 'var(--accent-rose)', color: '#fff', border: 'none' }}
                onClick={handleBulkDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete Selected'}
              </button>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Select assets to perform bulk actions</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
              disabled={isPending}
            >
              {isPending ? 'Importing...' : 'Import CSV'}
            </button>
            {isImportMenuOpen && (
              <div 
                onClick={() => setIsImportMenuOpen(false)}
                className="import-modal-overlay"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="import-modal-content"
                >
                  
                  <button 
                    onClick={() => setIsImportMenuOpen(false)}
                    className="import-modal-close"
                  >
                    ✕
                  </button>

                  <div>
                    <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>Import Assets</h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Follow the steps below to bulk import your assets via CSV.</p>
                  </div>

                  <div className="import-step-card">
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--accent-cyan)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="import-step-badge cyan">1</span>
                      Download Template
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Your CSV must contain the following exact column headers:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                      {["computerName", "serialNumber", "model", "assetNumber", "purchaseOrderNo", "status", "notes", "operatingSystem", "ipAddress", "macAddress"].map(header => (
                        <span key={header} className="import-column-badge">
                          {header}
                        </span>
                      ))}
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        const headers = "computerName,serialNumber,model,assetNumber,purchaseOrderNo,status,notes,operatingSystem,ipAddress,macAddress\n";
                        const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "assets_import_template.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Download CSV Template
                    </button>
                  </div>

                  <div className="import-step-card">
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--accent-emerald)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="import-step-badge emerald">2</span>
                      Upload Data
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Select your populated CSV file to import records into the system.
                    </p>
                    <button 
                      className="btn btn-secondary import-dropzone" 
                      onClick={() => { fileInputRef.current?.click(); setIsImportMenuOpen(false); }}
                    >
                      Click here to select .CSV file
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
          
          <a
            href={`/api/export/assets?search=${search || ''}&status=${status || ''}`}
            className="btn btn-secondary btn-sm"
            download
          >
            Export CSV
          </a>
          
          <Link href="/assets/new" className="btn btn-primary btn-sm">
            + Add Asset
          </Link>
        </div>
      </div>

      {/* Header: Tabs and View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div className="category-tabs" style={{ marginBottom: 0, borderBottom: 'none', flex: 1, minWidth: '300px' }}>
          {categories.map(tab => (
            <button
              key={tab}
              draggable={tab !== 'All'}
              onDragStart={(e) => handleDragStart(e, tab)}
              onDragEnter={(e) => handleDragEnter(e, tab)}
              onDragOver={(e) => handleDragOver(e, tab)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, tab)}
              className={`category-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
              style={{
                opacity: draggedItem === tab ? 0.5 : 1,
                borderLeft: dragOverItem === tab ? '2px solid #ffc145' : undefined,
                cursor: tab !== 'All' ? 'grab' : 'pointer',
                transition: 'border-color 0.2s ease, opacity 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="view-toggle" style={{ marginLeft: 'auto' }}>
          <button
            className="view-toggle-btn active"
            onClick={toggleViewMode}
            title={viewMode === 'table' ? 'Switch to Cards' : 'Switch to Table'}
            style={{ padding: '6px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
          >
            {viewMode === 'table' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="2"></rect>
                <rect x="14" y="14" width="7" height="7" rx="2"></rect>
                <path d="M14 10V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v5"></path>
                <path d="M10 14H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h5"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="glass-card animate-in">
          <div className="table-container" ref={tableContainerRef} onMouseDown={handleTableMouseDown}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={filteredAssets.length > 0 && selectedIds.length === filteredAssets.length}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Computer Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Operating System</th>
                  <th>IP Address</th>
                  <th>MAC Address</th>
                  <th>Serial Number</th>
                  <th>Assets number</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Purchase No</th>
                  <th>Purchase Date</th>
                  <th>Cost</th>
                  <th>Warranty Start</th>
                  <th>Age</th>
                  <th>Asset Label</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset.computerName} className="table-link-row">
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(asset.computerName)}
                        onChange={() => handleSelect(asset.computerName)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <Link href={`/assets/${asset.computerName}`}>
                        <strong style={{ color: 'var(--accent-cyan)' }}>
                          {asset.computerName}
                        </strong>
                      </Link>
                    </td>
                    <td>{asset.category?.categoryName || <span className="text-muted">—</span>}</td>
                    <td>{asset.brand?.brandName || <span className="text-muted">—</span>}</td>
                    <td>{asset.model || <span className="text-muted">—</span>}</td>
                    <td>{asset.operatingSystem || <span className="text-muted">—</span>}</td>
                    <td className="font-mono text-sm">{asset.ipAddress || <span className="text-muted">—</span>}</td>
                    <td className="font-mono text-sm">{asset.macAddress || <span className="text-muted">—</span>}</td>
                    <td className="font-mono text-sm">
                      {asset.serialNumber || <span className="text-muted">—</span>}
                    </td>
                    <td className="font-mono text-sm">
                      {asset.assetNumber || <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <StatusBadge status={asset.status} />
                    </td>
                    <td>{asset.location?.siteName || <span className="text-muted">—</span>}</td>
                    <td className="font-mono text-sm">
                      {asset.purchaseOrderNo || <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {asset.purchaseDate
                        ? new Date(asset.purchaseDate).toLocaleDateString()
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {asset.purchaseCost
                        ? `$${Number(asset.purchaseCost).toFixed(2)}`
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {asset.warrantyStart
                        ? new Date(asset.warrantyStart).toLocaleDateString()
                        : <span className="text-muted">—</span>}
                    </td>
                    <td className="font-mono text-sm">
                      {calculateAge(asset.warrantyStart).text}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <ToggleAssetLabel assetId={asset.computerName} initialStatus={asset.isAssetLabeled} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleDelete(asset.computerName)}
                        disabled={isPending}
                        title="Delete Asset"
                      >
                        <span style={{ color: 'var(--accent-rose)', fontSize: '1.2rem' }}>🗑</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedAssets.length === 0 && (
                  <tr>
                    <td colSpan={19} style={{ textAlign: 'center', padding: '2rem' }}>
                      <span className="text-muted">No assets found in this category.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch', justifyContent: 'flex-start' }}>
          {paginatedAssets.map(asset => {
            const ageObj = calculateAge(asset.warrantyStart)
            const ageColor = ageObj.years < 0 ? 'var(--text-muted)' : (ageObj.years < 3 ? 'var(--accent-emerald)' : 'var(--accent-rose)')

            return (
              <div key={asset.computerName} style={{ flex: '1 1 340px', maxWidth: '400px' }}>
                <div className="flip-card animate-in">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(asset.computerName)}
                            onChange={() => handleSelect(asset.computerName)}
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{asset.computerName}</span>
                        </div>
                        <StatusBadge status={asset.status} />
                      </div>
                      <div style={{ textAlign: 'left', marginTop: 'var(--space-md)' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{asset.model || asset.category?.categoryName || 'Unknown Model'}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{asset.brand?.brandName || 'No Brand'}</p>
                      </div>
                      <div style={{ marginTop: 'auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Age</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: ageColor }}>
                            {ageObj.text}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Hover for details ⤻</p>
                      </div>
                    </div>
                    <div className="flip-card-back">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <h4 style={{ margin: 0, color: 'var(--accent-cyan)' }}>Details</h4>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn-ghost" 
                            onClick={(e) => { e.stopPropagation(); handleDelete(asset.computerName); }}
                            disabled={isPending}
                            title="Delete Asset"
                            style={{ padding: '2px 8px', color: 'var(--accent-rose)' }}
                          >
                            🗑
                          </button>
                          <Link href={`/assets/${asset.computerName}`} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>View Full ↗</Link>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Category:</span>
                          <span>{asset.category?.categoryName || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
                          <span>{asset.location?.siteName || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Purchased:</span>
                          <span>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Cost:</span>
                          <span>{asset.purchaseCost ? `$${Number(asset.purchaseCost).toFixed(2)}` : '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Warranty Start:</span>
                          <span>{asset.warrantyStart ? new Date(asset.warrantyStart).toLocaleDateString() : '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Age:</span>
                          <span className="font-mono text-sm" style={{ color: ageColor, fontWeight: 600 }}>{ageObj.text}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--glass-border)' }}>
                        <ToggleAssetLabel assetId={asset.computerName} initialStatus={asset.isAssetLabeled} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {paginatedAssets.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', width: '100%' }}>
              <span className="text-muted">No assets found in this category.</span>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} entries
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              ← Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.9rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
