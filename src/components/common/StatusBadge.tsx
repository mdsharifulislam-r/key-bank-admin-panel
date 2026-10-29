import { formatStatusLabel } from '@/lib/format'

const tones: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Resolved: 'bg-emerald-50 text-emerald-700',
  Credit: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  Pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  Rejected: 'bg-red-50 text-red-700',
  Debit: 'bg-red-50 text-red-700',
  expired: 'bg-stone-100 text-stone-600',
  delete: 'bg-stone-100 text-stone-600',
  refunded: 'bg-blue-50 text-blue-700',
}

export function StatusBadge({ value }: { value?: string | null }) {
  if (!value) return <span className="text-muted">—</span>
  const tone = tones[value] ?? 'bg-canvas text-ink'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {formatStatusLabel(value)}
    </span>
  )
}
