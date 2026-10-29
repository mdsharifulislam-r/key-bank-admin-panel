import { Button } from 'antd'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/hooks'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePagedFilters } from '@/hooks/usePagedFilters'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/lib/format'
import type { AppNotification } from '@/lib/notifications'
import { countUnread } from '@/lib/notifications'
import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from '../notificationApi'

const statusCopy = {
  idle: 'Realtime idle',
  connecting: 'Connecting',
  connected: 'Channel connected',
  disconnected: 'Channel offline',
  error: 'Channel unavailable',
  unavailable: 'Not configured',
} as const

export default function NotificationsPage() {
  usePageTitle('Notifications')
  const filters = usePagedFilters()
  const socketStatus = useAppSelector((state) => state.notifications.socketStatus)
  const query = useGetNotificationsQuery({ page: filters.page, limit: filters.limit })
  const [markRead, readState] = useMarkNotificationReadMutation()
  const [markAll, allState] = useMarkAllNotificationsReadMutation()
  const notifications = query.data?.data.notifications ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Support"
        title="Notifications"
        description={`${countUnread(notifications)} unread on this page. Realtime status: ${statusCopy[socketStatus]}. The server has not published event names, so only payloads that match a notification are applied.`}
        extra={
          <Button
            type="primary"
            loading={allState.isLoading}
            disabled={countUnread(notifications) === 0}
            onClick={() => {
              void markAll()
                .unwrap()
                .then((response) => toast.success(response.message || 'All notifications marked read.'))
                .catch((error: unknown) => toast.error(getErrorMessage(error)))
            }}
          >
            Mark all read
          </Button>
        }
      />
      <DataTable<AppNotification>
        columns={[
          {
            title: 'Notification',
            dataIndex: 'title',
            render: (value: string, record) => (
              <div>
                <p className={record.isRead ? 'font-medium text-muted' : 'font-semibold text-ink'}>{value}</p>
                <p className="mt-1 max-w-xl text-sm text-muted">{record.message}</p>
              </div>
            ),
          },
          { title: 'Type', dataIndex: 'filePath', render: (value?: string) => value || '—' },
          { title: 'State', dataIndex: 'isRead', render: (value: boolean) => (value ? 'Read' : 'Unread') },
          { title: 'Received', dataIndex: 'createdAt', render: (value: string) => formatDateTime(value) },
          {
            title: '',
            key: 'read',
            render: (_, record) =>
              record.isRead ? null : (
                <Button
                  type="link"
                  loading={readState.isLoading && readState.originalArgs === record._id}
                  onClick={() => {
                    void markRead(record._id)
                      .unwrap()
                      .catch((error: unknown) => toast.error(getErrorMessage(error)))
                  }}
                >
                  Mark read
                </Button>
              ),
          },
        ]}
        rows={notifications}
        rowKey="_id"
        loading={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          total: query.data?.pagination?.total ?? 0,
          onChange: filters.onPageChange,
        }}
        emptyTitle="No notifications"
        emptyDescription="Alerts from reports and other server events will be listed here."
      />
    </div>
  )
}
