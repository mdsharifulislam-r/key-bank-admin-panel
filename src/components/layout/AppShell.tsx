import { Drawer } from 'antd'
import { Component, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch } from '@/app/hooks'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { profileLoaded } from '@/features/auth/authSlice'
import { useGetProfileQuery } from '@/features/auth/authApi'
import { parseProfile, profileToSession } from '@/lib/auth'
import { useNotificationSocket } from '@/features/notifications/useNotificationSocket'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

interface BoundaryProps {
  children: ReactNode
}

interface BoundaryState {
  error: Error | null
}

class PageErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error.message, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          title="This page ran into a problem"
          message="The view failed to render. You can try it again."
          onRetry={() => this.setState({ error: null })}
        />
      )
    }
    return this.props.children
  }
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const dispatch = useAppDispatch()
  const { data } = useGetProfileQuery()
  useNotificationSocket()

  useEffect(() => {
    const profile = parseProfile(data)
    if (profile) dispatch(profileLoaded(profileToSession(profile)))
  }, [data, dispatch])

  return (
    <div className="min-h-screen bg-canvas">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden lg:block ${collapsed ? 'w-[84px]' : 'w-[268px]'} transition-[width] duration-200`}
      >
        <AppSidebar collapsed={collapsed} />
      </aside>
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        placement="left"
        size={280}
        styles={{ body: { padding: 0, background: '#171A23' } }}
        closable={false}
      >
        <AppSidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>
      <div className={`${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[268px]'} transition-[padding] duration-200`}>
        <AppHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <PageErrorBoundary key={pathname}>
              <Suspense fallback={<LoadingState />}>
                <Outlet />
              </Suspense>
            </PageErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
