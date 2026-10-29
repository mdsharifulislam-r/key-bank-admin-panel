import { Tooltip } from 'antd'
import { NavLink } from 'react-router-dom'
import { BrandMark } from '@/components/common/BrandMark'
import { navigation } from './navigation'

interface AppSidebarProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function AppSidebar({ collapsed = false, onNavigate }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className={`border-b border-white/10 ${collapsed ? 'px-3 py-4' : 'px-4 py-4'}`}>
        {collapsed ? (
          <BrandMark compact className="mx-auto" />
        ) : (
          <>
            <BrandMark className="h-20" />
            <p className="px-2 text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">Admin Panel</p>
          </>
        )}
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Primary">
        {navigation.map((group) => (
          <div key={group.label}>
            {collapsed ? null : (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const link = (
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
                        collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                      } ${isActive ? 'bg-white/10 text-gold-soft' : 'text-white/70 hover:bg-white/5 hover:text-white'}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold" />
                        ) : null}
                        <Icon size={18} aria-hidden="true" />
                        {collapsed ? <span className="sr-only">{item.label}</span> : <span>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                )
                return collapsed ? (
                  <Tooltip key={item.key} title={item.label} placement="right">
                    {link}
                  </Tooltip>
                ) : (
                  <div key={item.key}>{link}</div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
