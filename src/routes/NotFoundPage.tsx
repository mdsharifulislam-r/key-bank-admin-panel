import { Button } from 'antd'
import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Not found')
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <section className="surface-card max-w-md p-8 text-center">
        <p className="text-xs font-semibold tracking-[0.16em] text-gold-deep uppercase">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">That page is not in the panel</h1>
        <p className="mt-2 text-sm text-muted">The address does not match a Keybank admin screen.</p>
        <Link to="/dashboard">
          <Button type="primary" className="mt-6">
            Go to overview
          </Button>
        </Link>
      </section>
    </main>
  )
}
