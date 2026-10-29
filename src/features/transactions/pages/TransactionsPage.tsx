import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchToolbar } from '@/components/common/SearchToolbar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePagedFilters } from '@/hooks/usePagedFilters'
import { formatAmount, formatDateTime, personLabel } from '@/lib/format'
import { useGetTransactionsQuery } from '../transactionsApi'
import type { Transaction } from '../types'

export default function TransactionsPage() {
  usePageTitle('Transactions')
  const filters = usePagedFilters()
  const query = useGetTransactionsQuery(filters.params)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finance"
        title="Transactions"
        description="Payment records from the admin transaction list. Amounts are shown exactly as the API returns them."
      />
      <SearchToolbar
        search={filters.searchInput}
        onSearch={filters.onSearchChange}
        placeholder="Search transactions"
        status={filters.status}
        onStatus={filters.onStatus}
        statusOptions={[
          { value: 'Completed', label: 'Completed' },
          { value: 'Pending', label: 'Pending' },
        ]}
      />
      <DataTable<Transaction>
        columns={[
          { title: 'Reference', dataIndex: 'trx_id', render: (value?: string) => value || '—' },
          { title: 'Title', dataIndex: 'title', render: (value?: string) => value || '—' },
          { title: 'Owner', dataIndex: 'owner', render: (value: Transaction['owner']) => personLabel(value) },
          { title: 'Amount', dataIndex: 'amount', render: (value?: number) => formatAmount(value) },
          { title: 'Type', dataIndex: 'payment_status', render: (value?: string) => <StatusBadge value={value} /> },
          { title: 'Status', dataIndex: 'status', render: (value?: string) => <StatusBadge value={value} /> },
          { title: 'Created', dataIndex: 'createdAt', render: (value?: string) => formatDateTime(value) },
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
        emptyTitle="No transactions found"
      />
    </div>
  )
}
