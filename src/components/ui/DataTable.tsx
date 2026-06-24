'use client'

import { useState, useRef, useTransition } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { TrashIcon, ArrowDownTrayIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'

type DataTableProps = {
  title?: string
  subtitle?: string
  headers: string[]
  rows: { id: string | number; cells: React.ReactNode[] }[]
  exportUrl?: string
  addUrl?: string
  addLabel?: string
  onDelete?: (id: any) => Promise<{ success?: boolean; error?: string }>
  onBulkDelete?: (ids: any[]) => Promise<{ success?: boolean; error?: string }>
  onImport?: (data: any[]) => Promise<{ success?: boolean; error?: string; count?: number }>
  importTemplateHeaders?: string
}

export function DataTable({
  title,
  subtitle,
  headers,
  rows,
  exportUrl,
  addUrl,
  addLabel = 'Add New',
  onDelete,
  onBulkDelete,
  onImport,
  importTemplateHeaders,
}: DataTableProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(rows.map(r => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string | number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleDelete = (id: string | number) => {
    if (!onDelete) return
    if (!confirm('Are you sure you want to delete this record?')) return
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      const result = await onDelete(id)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccessMessage('Record deleted successfully.')
        setSelectedIds(prev => prev.filter(x => x !== id))
      }
    })
  }

  const handleBulkDelete = () => {
    if (!onBulkDelete) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      const result = await onBulkDelete(selectedIds)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccessMessage(`${selectedIds.length} records deleted successfully.`)
        setSelectedIds([])
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImport) return

    setError(null)
    setSuccessMessage(null)
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        startTransition(async () => {
          const res = await onImport(results.data)
          if (res?.error) {
            setError(res.error)
          } else {
            setSuccessMessage(`Successfully imported ${res.count} records.`)
          }
          if (fileInputRef.current) fileInputRef.current.value = ''
        })
      },
      error: (err) => {
        setError('Failed to parse CSV file: ' + err.message)
      }
    })
  }

  const hasBulkActions = selectedIds.length > 0 && !!onBulkDelete
  const showToolbar = exportUrl || addUrl || onImport || onBulkDelete

  return (
    <div className="flex flex-col gap-4 animate-in">
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
      {showToolbar && (
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {hasBulkActions ? (
              <>
                <span style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>{selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected</span>
                <button 
                  className="btn btn-sm" 
                  style={{ backgroundColor: 'var(--accent-rose)', color: '#fff', border: 'none' }}
                  onClick={handleBulkDelete}
                  disabled={isPending}
                  title="Delete Selected"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Select rows to perform bulk actions</span>
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
                  title="Import Data"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Import CSV
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
                        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>Import Data</h2>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Follow the steps below to bulk import your records via CSV.</p>
                      </div>

                      {importTemplateHeaders && (
                        <div className="import-step-card">
                          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--accent-cyan)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="import-step-badge cyan">1</span>
                            Download Template
                          </h3>
                          <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Your CSV must contain the following exact column headers:
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                            {importTemplateHeaders.split(',').map(header => (
                              <span key={header} className="import-column-badge">
                                {header.trim()}
                              </span>
                            ))}
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              const csvContent = importTemplateHeaders.endsWith('\n') ? importTemplateHeaders : importTemplateHeaders + '\n';
                              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.setAttribute("href", url);
                              link.setAttribute("download", "import_template.csv");
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            style={{ width: '100%', justifyContent: 'center' }}
                          >
                            Download CSV Template
                          </button>
                        </div>
                      )}

                      <div className="import-step-card">
                        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--accent-emerald)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="import-step-badge emerald">{importTemplateHeaders ? '2' : '1'}</span>
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
            
            {exportUrl && (
              <a href={exportUrl} className="btn btn-secondary btn-sm" download title="Export CSV">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export CSV
              </a>
            )}
            
            {addUrl && (
              <Link href={addUrl} className="btn btn-primary btn-sm" title={`Add ${addLabel}`}>
                <PlusIcon className="w-4 h-4" />
                {addLabel || 'Add'}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {onBulkDelete && (
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={rows.length > 0 && selectedIds.length === rows.length}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                )}
                {headers.map((h, i) => <th key={i}>{h}</th>)}
                {onDelete && <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {onBulkDelete && (
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelect(row.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  {row.cells.map((cell, idx) => {
                    const isLastCell = idx === row.cells.length - 1;
                    if (isLastCell && onDelete) {
                      return (
                        <td key={idx} style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                            {cell}
                            <button 
                              className="btn btn-ghost btn-sm" 
                              onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
                              disabled={isPending}
                              title="Delete Record"
                              style={{ color: 'var(--accent-rose)' }}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      );
                    }
                    return <td key={idx}>{cell}</td>;
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length + (onBulkDelete ? 1 : 0) + (onDelete ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="text-muted">No records found.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
