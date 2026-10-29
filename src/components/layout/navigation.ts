import {
  Bell,
  Box,
  CalendarClock,
  CircleHelp,
  Flag,
  LayoutDashboard,
  Layers,
  Receipt,
  ScrollText,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  to: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ key: 'dashboard', label: 'Overview', to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { key: 'lockers', label: 'Lockers', to: '/lockers', icon: Box },
      { key: 'bookings', label: 'Bookings', to: '/bookings', icon: CalendarClock },
    ],
  },
  {
    label: 'Directory',
    items: [{ key: 'users', label: 'Users', to: '/users', icon: Users }],
  },
  {
    label: 'Finance',
    items: [
      { key: 'transactions', label: 'Transactions', to: '/transactions', icon: Receipt },
      { key: 'plans', label: 'Plans', to: '/plans', icon: Layers },
    ],
  },
  {
    label: 'Support',
    items: [
      { key: 'reports', label: 'Reports', to: '/reports', icon: Flag },
      { key: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell },
      { key: 'faqs', label: 'FAQs', to: '/faqs', icon: CircleHelp },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'audit', label: 'Audit log', to: '/audit-logs', icon: ScrollText },
      { key: 'settings', label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

export function titleForPath(pathname: string): string[] {
  if (pathname.startsWith('/lockers/')) return ['Operations', 'Lockers', 'Details']
  if (pathname.startsWith('/bookings/')) return ['Operations', 'Bookings', 'Details']
  for (const group of navigation) {
    const match = group.items.find((item) => item.to === pathname)
    if (match) return [group.label, match.label]
  }
  return ['Keybank']
}
