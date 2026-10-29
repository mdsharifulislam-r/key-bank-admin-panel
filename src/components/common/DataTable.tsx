import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getErrorMessage } from '@/lib/errors'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'

interface DataTableProps<T extends object> {
  columns: ColumnsType<T>
  rows: T[]
  rowKey: keyof T | ((record: T) => string)
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  pagination?: {
    page: number
    limit: number
    total: number
    onChange: (page: number, limit: number) => void
  } | null
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T extends object>({
  columns,
  rows,
  rowKey,
  loading = false,
  error,
  onRetry,
  pagination,
  emptyTitle = 'No records yet',
  emptyDescription = 'Records will appear here when the server returns them.',
}: DataTableProps<T>) {
  if (error && rows.length === 0 && !loading) {
    return <ErrorState message={getErrorMessage(error)} onRetry={onRetry} />
  }

  return (
    <div className="surface-card overflow-hidden">
      {error && rows.length > 0 ? (
        <div className="border-b border-line px-4 py-3 text-sm text-danger">{getErrorMessage(error)}</div>
      ) : null}
      <Table<T>
        columns={columns}
        dataSource={rows}
        rowKey={rowKey}
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={
          pagination
            ? {
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                showSizeChanger: true,
                onChange: pagination.onChange,
                showTotal: (total) => `${total} records`,
              }
            : false
        }
        locale={{
          emptyText: <EmptyState title={emptyTitle} description={emptyDescription} />,
        }}
      />
    </div>
  )
}
