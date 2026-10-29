import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: ReactNode
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <article className="surface-card flex items-start justify-between gap-4 p-5">
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
        {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-soft text-gold-deep">{icon}</div>
    </article>
  )
}
