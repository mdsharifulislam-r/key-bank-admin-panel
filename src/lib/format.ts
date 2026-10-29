import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = dayjs(value)
  return date.isValid() ? date.format('DD MMM YYYY, HH:mm') : '—'
}

export function formatRelative(value?: string | null): string {
  if (!value) return '—'
  const date = dayjs(value)
  return date.isValid() ? date.fromNow() : '—'
}

export function formatAmount(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCount(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatStatusLabel(value?: string | null): string {
  if (!value) return '—'
  if (value === 'delete') return 'Suspended'
  return value.replaceAll('_', ' ')
}

export function personLabel(person?: { name?: string | null; email?: string | null } | null): string {
  return person?.name || person?.email || '—'
}

export function toMonthlyPoints(
  series: Record<string, number> | undefined,
): { month: string; value: number }[] {
  return MONTHS.map((month) => ({
    month,
    value: Number(series?.[month] ?? 0),
  }))
}
