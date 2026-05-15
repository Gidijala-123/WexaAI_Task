'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/app/layout'
import ProductForm from '@/components/ProductForm'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    name: '', sku: '', description: '', quantityOnHand: '0',
    costPrice: '', sellingPrice: '', lowStockThreshold: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    api.products.get(params.id)
      .then((data) => {
        const p = data.product
        setForm({
          name: p.name,
          sku: p.sku,
          description: p.description || '',
          quantityOnHand: String(p.quantityOnHand),
          costPrice: p.costPrice != null ? String(p.costPrice) : '',
          sellingPrice: p.sellingPrice != null ? String(p.sellingPrice) : '',
          lowStockThreshold: p.lowStockThreshold != null ? String(p.lowStockThreshold) : '',
        })
      })
      .catch((err) => { addToast(err.message, 'error'); router.push('/products') })
      .finally(() => setFetching(false))
  }, [params.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.sku.trim()) return setError('Name and SKU are required')
    setLoading(true)
    try {
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        description: form.description.trim() || null,
        quantityOnHand: parseInt(form.quantityOnHand) || 0,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        sellingPrice: form.sellingPrice ? parseFloat(form.sellingPrice) : null,
        lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold) : null,
      }
      await api.products.update(params.id, body)
      addToast('Product updated successfully', 'success')
      router.push('/products')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/products/${params.id}`} className="btn-ghost p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">{form.sku || 'Loading...'}</p>
        </div>
      </div>

      <ProductForm form={form} onChange={setForm} onSubmit={handleSubmit}
        error={error} loading={loading} submitLabel="Save Changes"
        loadingLabel="Saving..." cancelHref={`/products/${params.id}`} />
    </div>
  )
}
