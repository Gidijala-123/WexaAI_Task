'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/app/layout'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { TableSkeleton } from '@/components/LoadingSkeleton'

export default function ProductsPage() {
  const { addToast } = useToast()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [adjustingId, setAdjustingId] = useState(null)

  const load = useCallback(async (q) => {
    setLoading(true)
    try {
      const data = await api.products.list(q)
      setProducts(data.products)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    load(searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    load()
  }

  const confirmDelete = (product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!selectedProduct) return
    try {
      await api.products.delete(selectedProduct.id)
      setProducts(products.filter((p) => p.id !== selectedProduct.id))
      addToast(`"${selectedProduct.name}" deleted successfully`, 'success')
    } catch (err) {
      addToast(err.message, 'error')
    }
    setShowDeleteModal(false)
    setSelectedProduct(null)
  }

  const handleAdjust = async (id, adjustment) => {
    setAdjustingId(id)
    try {
      const data = await api.products.adjustStock(id, adjustment)
      setProducts(products.map((p) => (p.id === id ? data.product : p)))
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setAdjustingId(null)
    }
  }

  const getStatus = (product) => {
    const threshold = product.lowStockThreshold ?? 5
    if (product.quantityOnHand === 0) return { label: 'Out of Stock', class: 'badge-red' }
    if (product.quantityOnHand <= threshold) return { label: 'Low Stock', class: 'badge-red' }
    return { label: 'In Stock', class: 'badge-green' }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your inventory</p>
        </div>
        <Link href="/products/create" className="btn-primary">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or SKU..."
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
        {search && (
          <button type="button" onClick={clearSearch} className="btn-ghost">Clear</button>
        )}
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : products.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={search ? 'No products found' : 'No products yet'}
              description={search ? `No products matching "${search}"` : 'Get started by adding your first product'}
              actionLabel={search ? 'Clear search' : 'Add Product'}
              actionHref={search ? undefined : '/products/create'}
              onAction={search ? clearSearch : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">SKU</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Quantity</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Selling Price</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Updated</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const status = getStatus(product)
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/products/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{product.quantityOnHand}</td>
                      <td className="px-6 py-4"><span className={status.class}>{status.label}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{formatDateTime(product.updatedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleAdjust(product.id, -1)}
                            disabled={adjustingId === product.id || product.quantityOnHand <= 0}
                            className="btn-ghost p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30"
                            title="Decrease stock"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-xs text-gray-400 w-5 text-center">{adjustingId === product.id ? '...' : ''}</span>
                          <button
                            onClick={() => handleAdjust(product.id, 1)}
                            disabled={adjustingId === product.id}
                            className="btn-ghost p-1.5 text-gray-400 hover:text-emerald-600 disabled:opacity-30"
                            title="Increase stock"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <Link href={`/products/${product.id}/edit`} className="btn-ghost text-indigo-600 hover:text-indigo-700">
                            Edit
                          </Link>
                          <button onClick={() => confirmDelete(product)} className="btn-ghost text-red-500 hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Product">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
