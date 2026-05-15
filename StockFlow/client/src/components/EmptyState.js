import Link from 'next/link'

export default function EmptyState({ title, description, actionLabel, actionHref, onAction }) {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {actionHref && (
        <div className="mt-6">
          <Link href={actionHref} className="btn-primary">
            {actionLabel}
          </Link>
        </div>
      )}
      {onAction && (
        <div className="mt-6">
          <button onClick={onAction} className="btn-primary">{actionLabel}</button>
        </div>
      )}
    </div>
  )
}
