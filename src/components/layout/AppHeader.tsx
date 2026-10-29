import { Button, Dropdown } from 'antd'
import { ImagePreview } from '@/components/common/ImagePreview'
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { sessionCleared } from '@/features/auth/authSlice'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { titleForPath } from './navigation'

interface AppHeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenMobile: () => void
}

export function AppHeader({ collapsed, onToggleCollapse, onOpenMobile }: AppHeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const crumbs = titleForPath(pathname)
  const name = user?.name || user?.email || 'Administrator'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          className="lg:hidden"
          aria-label="Open navigation"
          type="text"
          icon={<Menu size={18} />}
          onClick={onOpenMobile}
        />
        <Button
          className="hidden lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="text"
          icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          onClick={onToggleCollapse}
        />
        <nav aria-label="Breadcrumb" className="min-w-0 truncate text-sm text-muted">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb}-${index}`}>
              {index > 0 ? <span className="mx-1.5 text-line">/</span> : null}
              <span className={index === crumbs.length - 1 ? 'font-semibold text-ink' : undefined}>{crumb}</span>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationBell />
        <Dropdown
          menu={{
            items: [
              {
                key: 'settings',
                icon: <Settings size={16} />,
                label: 'Settings',
                onClick: () => navigate('/settings'),
              },
              {
                key: 'logout',
                icon: <LogOut size={16} />,
                label: 'Log out',
                onClick: () => dispatch(sessionCleared()),
              },
            ],
          }}
          trigger={['click']}
        >
          <button
            type="button"
            className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-canvas"
            aria-label="Account menu"
          >
            <ImagePreview src={user?.image} alt={name} size={32} rounded="full" fallback={name} />
            <span className="hidden text-left sm:block">
              <span className="block max-w-36 truncate text-sm font-semibold text-ink">{name}</span>
              <span className="block text-[11px] text-muted">{user?.role || 'Administrator'}</span>
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  )
}
