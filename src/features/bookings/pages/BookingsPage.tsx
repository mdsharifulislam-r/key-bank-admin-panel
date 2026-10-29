import { Button } from 'antd'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchToolbar } from '@/components/common/SearchToolbar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePagedFilters } from '@/hooks/usePagedFilters'
import { formatAmount, formatDateTime, personLabel } from '@/lib/format'
import { useGetBookingsQuery } from '../bookingsApi'
import type { Booking } from '../types'

const statuses = ['pending', 'confirmed', 'cancelled', 'expired', 'completed', 'refunded']

export default function BookingsPage() {
  usePageTitle('Bookings')
  const filters = usePagedFilters()
  const query = useGetBookingsQuery(filters.params)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        description="Compartment bookings across lockers. Cancel and refund actions are available on the booking record."
      />
      <SearchToolbar
        search={filters.searchInput}
        onSearch={filters.onSearchChange}
        placeholder="Search bookings"
        status={filters.status}
        onStatus={filters.onStatus}
        statusOptions={statuses.map((value) => ({ value, label: value }))}
      />
      <DataTable<Booking>
        columns={[
          {
            title: 'Booking',
            dataIndex: 'booking_id',
            render: (value: string, record) => (
              <Link className="font-semibold text-gold-deep" to={`/bookings/${record._id}`}>
                {value || record._id}
              </Link>
            ),
          },
          { title: 'User', dataIndex: 'user', render: (value: Booking['user']) => personLabel(value) },
          { title: 'Locker', dataIndex: 'lockerNo' },
          { title: 'Box', dataIndex: 'boxNo' },
          { title: 'Amount', dataIndex: 'price', render: (value?: number) => formatAmount(value) },
          { title: 'Status', dataIndex: 'status', render: (value?: string) => <StatusBadge value={value} /> },
          { title: 'Created', dataIndex: 'createdAt', render: (value?: string) => formatDateTime(value) },
          {
            title: '',
            key: 'open',
            render: (_, record) => (
              <Link to={`/bookings/${record._id}`}>
                <Button type="link">Open</Button>
              </Link>
            ),
          },
        ]}
        rows={query.data?.data ?? []}
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
        emptyTitle="No bookings found"
      />
    </div>
  )
}
