import { Badge, Button, Popover } from 'antd'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/lib/errors'
import { formatRelative } from '@/lib/format'
import { countUnread } from '@/lib/notifications'
import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from '../notificationApi'

const statusCopy = {
  idle: 'Realtime idle',
  connecting: 'Connecting realtime channel',
  connected: 'Realtime channel connected',
  disconnected: 'Realtime channel offline',
  error: 'Realtime channel unavailable',
  unavailable: 'Realtime channel is not configured',
} as const

export function NotificationBell() {
  const socketStatus = useAppSelector((state) => state.notifications.socketStatus)
  const { data, isLoading, isError, error, refetch } = useGetNotificationsQuery({ page: 1, limit: 8 })
  const [markRead] = useMarkNotificationReadMutation()
  const [markAll, markAllState] = useMarkAllNotificationsReadMutation()
  const notifications = data?.data.notifications ?? []
  const unread = countUnread(notifications)
  const badge = unread > 0 && data?.pagination && data.pagination.total > notifications.length && unread === notifications.length
    ? `${unread}+`
    : unread

  const content = (
    <div className="w-[min(360px,calc(100vw-2rem))]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Notifications</p>
          <p className="text-xs text-muted">{statusCopy[socketStatus]}</p>
        </div>
        <Button
          type="link"
          size="small"
          disabled={unread === 0}
          loading={markAllState.isLoading}
          onClick={() => void markAll()}
        >
          Mark all read
        </Button>
      </div>
      {isError ? (
        <div className="space-y-2">
          <p className="text-sm text-danger">{getErrorMessage(error)}</p>
          <Button size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
      {isLoading ? <p className="py-6 text-center text-sm text-muted">Loading notifications…</p> : null}
      {!isLoading && notifications.length === 0 ? (
        <EmptyState title="No notifications" description="New alerts from the server will show up here." />
      ) : null}
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {notifications.map((item) => (
          <button
            key={item._id}
            type="button"
            className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-canvas ${
              item.isRead ? 'opacity-70' : 'bg-gold-soft/40'
            }`}
            onClick={() => {
              if (!item.isRead) void markRead(item._id)
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <span className="shrink-0 text-[11px] text-muted">{formatRelative(item.createdAt)}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.message}</p>
            {item.filePath ? <p className="mt-1 text-[11px] font-medium text-gold-deep">{item.filePath}</p> : null}
          </button>
        ))}
      </div>
      <Link to="/notifications" className="mt-3 block text-center text-sm font-semibold text-gold-deep">
        View all notifications
      </Link>
    </div>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Badge count={badge} color="#C9961B" offset={[-2, 4]}>
        <Button
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          icon={<Bell size={18} />}
          type="text"
        />
      </Badge>
    </Popover>
  )
}
