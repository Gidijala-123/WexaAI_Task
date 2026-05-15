'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { PageSkeleton, CardSkeleton } from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function LowStockBarChart({ items }) {
  if (!items || items.length === 0) return null
  const maxQty = Math.max(...items.map((i) => i.quantityOnHand), 1)
  return (
    <div className="mt-6 space-y-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Levels</h4>
      {items.slice(0, 5).map((item) => {
        const pct = (item.quantityOnHand / item.threshold) * 100
        const barWidth = Math.min((item.quantityOnHand / maxQty) * 100, 100)
        return (
          <div key={item.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium truncate">{item.name}</span>
              <span className="text-gray-500">{item.quantityOnHand} / {item.threshold}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct <= 50 ? 'bg-red-500' : pct <= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.get()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSkeleton />

  const stats = [
    {
      label: 'Total Products',
      value: data?.totalProducts ?? 0,
      color: 'bg-indigo-50 text-indigo-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Total Stock',
      value: data?.totalQuantity?.toLocaleString() ?? 0,
      color: 'bg-emerald-50 text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Low Stock Items',
      value: data?.lowStockItems?.length ?? 0,
      color: data?.lowStockItems?.length > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
  ]

  const lowStockWithThreshold = (data?.lowStockItems ?? []).map((item) => ({
    ...item,
    threshold: item.lowStockThreshold ?? 5,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your inventory</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Items</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all products
          </Link>
        </div>
        {lowStockWithThreshold.length > 0 ? (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-2">Product</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-2 hidden sm:table-cell">SKU</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-2 whitespace-nowrap">On Hand</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 pr-2">Threshold</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lowStockWithThreshold.map((item) => {
                    const ratio = item.quantityOnHand / item.threshold
                    const badgeClass = ratio <= 0.5 ? 'badge-red' : 'badge-gray'
                    const badgeText = ratio <= 0.5 ? 'Critical' : 'Low'
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 pr-2 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="py-3.5 pr-2 text-sm text-gray-500 hidden sm:table-cell">{item.sku}</td>
                        <td className="py-3.5 pr-2 text-sm font-semibold text-red-600 whitespace-nowrap">{item.quantityOnHand}</td>
                        <td className="py-3.5 pr-2 text-sm text-gray-500 whitespace-nowrap">{item.threshold}</td>
                        <td className="py-3.5 whitespace-nowrap"><span className={badgeClass}>{badgeText}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <LowStockBarChart items={lowStockWithThreshold} />
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              title="All stocked up"
              description="No products are below their low stock threshold."
              actionLabel="Add product"
              actionHref="/products/create"
            />
          </div>
        )}
      </div>
    </div>
  )
}
