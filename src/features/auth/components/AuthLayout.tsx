import type { ReactNode } from 'react'
import { BrandMark } from '@/components/common/BrandMark'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,520px)]">
      <section className="relative hidden flex-col justify-between bg-ink px-12 py-10 text-white lg:flex">
        <div className="max-w-sm">
          <BrandMark className="h-28" />
          <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-gold uppercase">Admin Panel</p>
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl leading-tight font-semibold">Control lockers, compartments, and access.</h1>
          <p className="mt-4 text-base leading-7 text-white/70">
            A single operations desk for bookings, payments, reports, and the people using Keybank MENA.
          </p>
        </div>
        <p className="text-sm text-white/45">Sessions stay in this browser tab and end when it closes.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <BrandMark className="h-20" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-sm text-muted">{footer}</div> : null}
        </div>
      </section>
    </main>
  )
}
