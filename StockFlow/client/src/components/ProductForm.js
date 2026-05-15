'use client'
import Link from 'next/link'

export default function ProductForm({ form, onChange, onSubmit, error, loading, submitLabel, loadingLabel, cancelHref }) {
  const update = (field) => (e) => onChange({ ...form, [field]: e.target.value })

  return (
    <div className="card p-6">
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="input-label">Product Name *</label>
            <input type="text" required value={form.name} onChange={update('name')} className="input-field" placeholder="e.g. Wireless Mouse" />
          </div>
          <div>
            <label className="input-label">SKU *</label>
            <input type="text" required value={form.sku} onChange={update('sku')} className="input-field font-mono" placeholder="e.g. WM-001" />
          </div>
          <div>
            <label className="input-label">Quantity on Hand</label>
            <input type="number" min="0" value={form.quantityOnHand} onChange={update('quantityOnHand')} className="input-field" />
          </div>
        </div>

        <div>
          <label className="input-label">Description</label>
          <textarea value={form.description} onChange={update('description')} rows={3} className="input-field" placeholder="Optional description..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Cost Price ($)</label>
            <input type="number" step="0.01" min="0" value={form.costPrice} onChange={update('costPrice')} className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="input-label">Selling Price ($)</label>
            <input type="number" step="0.01" min="0" value={form.sellingPrice} onChange={update('sellingPrice')} className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="input-label">Low Stock Threshold</label>
            <input type="number" min="0" value={form.lowStockThreshold} onChange={update('lowStockThreshold')} className="input-field" placeholder="Global default" />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? loadingLabel : submitLabel}
          </button>
          <Link href={cancelHref} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
