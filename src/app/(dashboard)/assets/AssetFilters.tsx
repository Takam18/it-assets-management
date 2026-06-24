'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { assetStatusOptions } from '@/lib/validations'

export function AssetFilters({
  currentSearch,
  currentStatus,
}: {
  currentSearch?: string
  currentStatus?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/assets?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams('search', search)
  }

  return (
    <div className="filter-bar">
      <form onSubmit={handleSearch} className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by tag, serial, computer name, model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <select
        className="filter-select"
        value={currentStatus || 'all'}
        onChange={(e) => updateParams('status', e.target.value === 'all' ? '' : e.target.value)}
      >
        <option value="all">All Statuses</option>
        {assetStatusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
