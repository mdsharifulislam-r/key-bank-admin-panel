import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchToolbar } from '@/components/common/SearchToolbar'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePagedFilters } from '@/hooks/usePagedFilters'
import { formatDateTime, personLabel } from '@/lib/format'
import { useGetAuditLogsQuery } from '../auditApi'
import { auditBoxLabel, auditLockerLabel } from '../display'
import type { AuditLog } from '../types'

export default function AuditLogsPage() {
  usePageTitle('Audit log')
  const filters = usePagedFilters()
  const query = useGetAuditLogsQuery(filters.params)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System"
        title="Audit log"
        description="A record of account, booking, and report activity returned by the server."
      />
      <SearchToolbar search={filters.searchInput} onSearch={filters.onSearchChange} placeholder="Search audit log" />
      <DataTable<AuditLog>
        columns={[
          { title: 'When', dataIndex: 'createdAt', render: (value?: string) => formatDateTime(value) },
          { title: 'Action', dataIndex: 'action', render: (value?: string) => value || '—' },
          { title: 'Locker', key: 'locker', render: (_value, record) => auditLockerLabel(record) },
          { title: 'Box', key: 'box', render: (_value, record) => auditBoxLabel(record) },
          { title: 'Person', dataIndex: 'user', render: (value: AuditLog['user']) => personLabel(value) },
          { title: 'Role', dataIndex: 'user', render: (value: AuditLog['user']) => value?.role || '—' },
          { title: 'From', dataIndex: 'old_value', render: (value?: string | null) => value || '—' },
          { title: 'To', dataIndex: 'new_value', render: (value?: string | null) => value || '—' },
          { title: 'Reason', dataIndex: 'reason', render: (value?: string | null) => value || '—' },
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
        emptyTitle="No audit entries"
      />
    </div>
  )
}
