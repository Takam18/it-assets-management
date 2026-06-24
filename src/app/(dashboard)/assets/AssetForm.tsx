'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAsset, updateAsset } from '@/actions/assets'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { assetStatusOptions } from '@/lib/validations'
import type { Asset, AssetCategory, Vendor, Location, Brand, Area } from '@prisma/client'
import type { AssetStatus } from '@/lib/types'

type AssetFormProps = {
  asset?: Asset | null
  categories: AssetCategory[]
  vendors: Vendor[]
  locations: Location[]
  brands: Brand[]
  areas: Area[]
}

export function AssetForm({ asset, categories, vendors, locations, brands, areas }: AssetFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(asset?.categoryId?.toString() || '')
  const [purchaseCost, setPurchaseCost] = useState<string>(asset?.purchaseCost ? String(asset.purchaseCost) : '')

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCatId = e.target.value
    setSelectedCategory(newCatId)
    
    // Auto-populate default price for new assets
    if (!asset) {
      const cat = categories.find(c => c.id.toString() === newCatId)
      if (cat && cat.defaultPrice != null) {
        setPurchaseCost(String(cat.defaultPrice))
      } else {
        setPurchaseCost('')
      }
    }
  }

  const showComputerFields = () => {
    const category = categories.find(c => c.id.toString() === selectedCategory)
    if (!category) return false
    const name = category.categoryName.toLowerCase()
    return name.includes('desktop') || name.includes('laptop') || name.includes('workstation')
  }

  const showFinancialFields = () => {
    const category = categories.find(c => c.id.toString() === selectedCategory)
    if (!category) return true
    return !category.categoryName.toLowerCase().includes('cnc machine')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      computerName: form.get('computerName') as string,
      serialNumber: form.get('serialNumber') as string,
      assetNumber: form.get('assetNumber') as string,
      categoryId: form.get('categoryId') ? Number(form.get('categoryId')) : null,
      brandId: form.get('brandId') ? Number(form.get('brandId')) : null,
      vendorId: form.get('vendorId') ? Number(form.get('vendorId')) : null,
      model: form.get('model') as string,
      purchaseOrderNo: form.get('purchaseOrderNo') as string,
      purchaseDate: form.get('purchaseDate') as string,
      purchaseCost: form.get('purchaseCost') ? Number(form.get('purchaseCost')) : null,
      warrantyStart: form.get('warrantyStart') as string,
      warrantyExpiration: form.get('warrantyExpiration') as string,
      status: ((form.get('status') as string) || 'In Stock') as AssetStatus,
      locationId: form.get('locationId') ? Number(form.get('locationId')) : null,
      areaId: form.get('areaId') ? Number(form.get('areaId')) : null,
      notes: form.get('notes') as string,
      operatingSystem: showComputerFields() ? (form.get('operatingSystem') as string) : null,
      ipAddress: showComputerFields() ? (form.get('ipAddress') as string) : null,
      macAddress: showComputerFields() ? (form.get('macAddress') as string) : null,
      isAssetLabeled: form.get('isAssetLabeled') === 'on',
    }

    try {
      if (asset) {
        await updateAsset(asset.computerName, data)
      } else {
        await createAsset(data)
      }
      router.push('/assets')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="warranty-alert" style={{ marginBottom: 'var(--space-lg)' }}>
          <span className="warranty-alert-icon">⚠</span>
          <span className="warranty-alert-text">{error}</span>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="computerName">Computer Name / Asset ID *</label>
          <input
            id="computerName"
            name="computerName"
            className="form-input"
            required
            defaultValue={asset?.computerName || ''}
            placeholder="e.g., WS-JSmith-01 or IT-MON-001"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="serialNumber">Serial Number</label>
          <input
            id="serialNumber"
            name="serialNumber"
            className="form-input"
            defaultValue={asset?.serialNumber || ''}
            placeholder="Manufacturer serial number"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="assetNumber">Asset Number</label>
          <input
            id="assetNumber"
            name="assetNumber"
            className="form-input"
            defaultValue={asset?.assetNumber || ''}
            placeholder="Internal asset number"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="model">Model</label>
          <input
            id="model"
            name="model"
            className="form-input"
            defaultValue={asset?.model || ''}
            placeholder="e.g., Dell Latitude 5540"
          />
        </div>
      </div>

      {showComputerFields() && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="operatingSystem">Operating System</label>
            <input
              id="operatingSystem"
              name="operatingSystem"
              className="form-input"
              defaultValue={asset?.operatingSystem || ''}
              placeholder="e.g. Windows 11 Pro, macOS Sonoma"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ipAddress">IP Address</label>
            <input
              id="ipAddress"
              name="ipAddress"
              className="form-input"
              defaultValue={asset?.ipAddress || ''}
              placeholder="e.g. 192.168.1.50"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="macAddress">MAC Address</label>
            <input
              id="macAddress"
              name="macAddress"
              className="form-input"
              defaultValue={asset?.macAddress || ''}
              placeholder="e.g. 00:1A:2B:3C:4D:5E"
            />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="categoryId">Category</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            className="form-select" 
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.categoryName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="brandId">Brand</label>
          <select 
            id="brandId" 
            name="brandId" 
            className="form-select" 
            defaultValue={asset?.brandId || ''}
          >
            <option value="">Select brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.brandName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="vendorId">Vendor</label>
          <select id="vendorId" name="vendorId" className="form-select" defaultValue={asset?.vendorId || ''}>
            <option value="">Select vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>{v.vendorName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="form-select" defaultValue={asset?.status || 'In Stock'}>
            {assetStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="locationId">Location</label>
          <select id="locationId" name="locationId" className="form-select" defaultValue={asset?.locationId || ''}>
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.siteName}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="areaId">Area</label>
          <select id="areaId" name="areaId" className="form-select" defaultValue={asset?.areaId || ''}>
            <option value="">Select area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.building} - {a.room} - {a.location}</option>
            ))}
          </select>
        </div>
      </div>

      {showFinancialFields() && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="purchaseOrderNo">Purchase No</label>
            <input
              id="purchaseOrderNo"
              name="purchaseOrderNo"
              className="form-input"
              defaultValue={asset?.purchaseOrderNo || ''}
              placeholder="e.g. PO-12345"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="purchaseDate">Purchase Date</label>
            <input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              className="form-input"
              defaultValue={formatDate(asset?.purchaseDate)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="purchaseCost">Purchase Cost ($)</label>
            <input
              id="purchaseCost"
              name="purchaseCost"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="warrantyStart">Warranty Start</label>
            <input
              id="warrantyStart"
              name="warrantyStart"
              type="date"
              className="form-input"
              defaultValue={formatDate(asset?.warrantyStart)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="warrantyExpiration">Warranty Expiration</label>
            <input
              id="warrantyExpiration"
              name="warrantyExpiration"
              type="date"
              className="form-input"
              defaultValue={formatDate(asset?.warrantyExpiration)}
            />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            className="form-textarea"
            defaultValue={asset?.notes || ''}
            placeholder="Additional notes about this asset..."
          />
        </div>
        <div className="form-group">
          <label className="form-label">Asset Label</label>
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="isAssetLabeled" 
                defaultChecked={asset?.isAssetLabeled || false}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <span>Label Printed & Applied</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} title={loading ? 'Saving...' : asset ? 'Update Asset' : 'Create Asset'}>
          {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <CheckIcon className="w-5 h-5" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => router.back()} title="Cancel">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
