'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/app/layout'
import { CardSkeleton } from '@/components/LoadingSkeleton'

export default function SettingsPage() {
  const { addToast } = useToast()
  const [threshold, setThreshold] = useState('5')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    api.settings.get()
      .then((data) => setThreshold(String(data.settings.defaultLowStockThreshold)))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setFetching(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.settings.update({ defaultLowStockThreshold: parseInt(threshold) })
      addToast('Settings saved successfully', 'success')
      setDirty(false)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="space-y-6"><div className="h-8 bg-gray-200 rounded w-48 animate-pulse" /><CardSkeleton /></div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure your organization preferences</p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="input-label text-base">Default Low Stock Threshold</label>
            <p className="text-sm text-gray-500 mb-3">
              This threshold is used for any product that doesn&apos;t have its own low stock threshold set.
              Products with quantity at or below this number will appear in the low stock report.
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                min="0"
                required
                value={threshold}
                onChange={(e) => { setThreshold(e.target.value); setDirty(true) }}
                className="input-field w-32"
              />
              <span className="text-sm text-gray-500">units</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button type="submit" disabled={loading || !dirty} className="btn-primary">
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            {!dirty && <span className="text-xs text-gray-400">No changes to save</span>}
          </div>
        </form>
      </div>

      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Organization</h2>
        <p className="text-sm text-gray-500">
          Your organization and account settings are managed through your account. Contact support for changes.
        </p>
      </div>
    </div>
  )
}
