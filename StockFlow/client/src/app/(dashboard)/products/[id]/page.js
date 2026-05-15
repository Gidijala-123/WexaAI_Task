'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/app/layout'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Modal from '@/components/Modal'
import { CardSkeleton } from '@/components/LoadingSkeleton'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [product, setProduct] = useState(null)
  const [defaultThreshold, setDefaultThreshold] = useState(5)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [adjustment, setAdjustment] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => {
    Promise.all([
      api.products.get(params.id),
      api.settings.get().catch(() => ({ settings: { defaultLowStockThreshold: 5 } })),
    ])
      .then(([productData, settingsData]) => {
        setProduct(productData.product)
        setDefaultThreshold(settingsData.settings.defaultLowStockThreshold)
      })
      .catch((err) => { addToast(err.message, 'error'); router.push('/products') })
      .finally(() => setLoading(false))
  }, [params.id])

  const handleDelete = async () => {
    try {
      await api.products.delete(product.id)
      addToast(`"${product.name}" deleted`, 'success')
      router.push('/products')
    } catch (err) { addToast(err.message, 'error') }
  }

  const handleAdjust = async () => {
    const adj = parseInt(adjustment)
    if (isNaN(adj) || adj === 0) return addToast('Enter a valid adjustment', 'error')
    setAdjusting(true)
    try {
      const data = await api.products.adjustStock(product.id, adj)
      setProduct(data.product)
      setAdjustment('')
      addToast(`Stock adjusted by ${adj > 0 ? '+' : ''}${adj}`, 'success')
    } catch (err) { addToast(err.message, 'error') }
    setAdjusting(false)
  }

  if (loading) return <div className="space-y-6"><div className="h-8 bg-gray-200 rounded w-48 animate-pulse" /><CardSkeleton /></div>
  if (!product) return null

  const threshold = product.lowStockThreshold ?? defaultThreshold
  const isLow = product.quantityOnHand <= threshold

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <Link href="/products" className="btn-ghost p-1 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Link href={`/products/${product.id}/edit`} className="btn-secondary text-xs sm:text-sm px-3 sm:px-4">Edit</Link>
          <button onClick={() => setShowDeleteModal(true)} className="btn-danger text-xs sm:text-sm px-3 sm:px-4">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Quantity on Hand</p>
          <p className={`text-3xl font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{product.quantityOnHand}</p>
          <span className={`mt-2 inline-block text-xs font-medium ${isLow ? 'badge-red' : 'badge-green'}`}>
            {isLow ? 'Low Stock' : 'In Stock'}
          </span>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Selling Price</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(product.sellingPrice)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 mb-1">Cost Price</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(product.costPrice)}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Stock Adjustment</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="w-full sm:w-auto">
              <label className="input-label">Adjust by (+/-)</label>
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                className="input-field w-full sm:w-40"
                placeholder="e.g. 5 or -3"
              />
            </div>
            <button onClick={handleAdjust} disabled={adjusting || !adjustment} className="btn-primary w-full sm:w-auto">
              {adjusting ? 'Adjusting...' : 'Apply'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Use positive numbers to add stock, negative to remove.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{product.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">SKU</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5 font-mono">{product.sku}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-gray-500">Description</dt>
              <dd className="text-sm text-gray-900 mt-0.5">{product.description || 'No description'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Low Stock Threshold</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{product.lowStockThreshold ?? `Global default (${threshold})`}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Cost Price</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatCurrency(product.costPrice)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Selling Price</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatCurrency(product.sellingPrice)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatDateTime(product.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last Updated</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatDateTime(product.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Product">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{product?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
