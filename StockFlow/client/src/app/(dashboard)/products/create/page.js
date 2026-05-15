'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/app/layout'
import ProductForm from '@/components/ProductForm'

export default function CreateProductPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    name: '', sku: '', description: '', quantityOnHand: '0',
    costPrice: '', sellingPrice: '', lowStockThreshold: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

      <ProductForm form={form} onChange={setForm} onSubmit={handleSubmit}
        error={error} loading={loading} submitLabel="Create Product"
        loadingLabel="Creating..." cancelHref="/products" />
    </div>
  )
}
