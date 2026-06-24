'use client'

import { useState } from 'react'
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

export function StatusBadge({ status }: { status: string }) {
  const className = status.toLowerCase().replace(/[\s\/]/g, '')
  const labels: Record<string, string> = {
    'In Stock': 'In Stock',
    Assigned: 'Assigned',
    InRepair: 'In Repair',
    LostStolen: 'Lost / Stolen',
    Retired: 'Retired',
    Active: 'Active',
    Terminated: 'Terminated',
    OnLeave: 'On Leave',
  }
  return (
    <span className={`status-badge ${className}`}>
      {labels[status] || status}
    </span>
  )
}

export function DeleteModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-body">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} title="Cancel">
            <XMarkIcon className="w-5 h-5" />
          </button>
          <button className="btn btn-danger" onClick={onConfirm} title="Delete">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string
  type?: 'success' | 'error' | 'warning'
  onClose: () => void
}) {
  const icons = { success: '✓', error: '✕', warning: '⚠' }
  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} title="Close">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return <div className="toast-container">{children}</div>
}

export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{ id: number; message: string; type: 'success' | 'error' | 'warning' }>
  >([])

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, showToast, removeToast }
}

export function EmptyState({
  icon = '📦',
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: React.ReactNode
}) {
  return (
    <div className="page-header">
      {breadcrumbs && (
        <div className="breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span className="breadcrumb-sep"> / </span>}
              {crumb.href ? (
                <a href={crumb.href}>{crumb.label}</a>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div className="page-header-top">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-sm">{actions}</div>}
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  )
}
