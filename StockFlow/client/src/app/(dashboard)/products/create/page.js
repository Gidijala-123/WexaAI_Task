'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/app/layout'

export default function CreateProductPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    name: '', sku: '', description: '', quantityOnHand: '0',
    costPrice: '', sellingPrice: '', lowStockThreshold: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.sku.trim()) return setError('Name and SKU are required')
    setLoading(true)
    try {
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim() || undefined,
        quantityOnHand: parseInt(form.quantityOnHand) || 0,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        sellingPrice: form.sellingPrice ? parseFloat(form.sellingPrice) : undefined,
        lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold) : undefined,
      }
      await api.products.create(body)
      addToast('Product created successfully', 'success')
      router.push('/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="btn-ghost p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Add a new product to your inventory</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
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
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link href="/products" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
