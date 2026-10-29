import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmActionModal } from '@/components/common/ConfirmActionModal'
import { DataTable } from '@/components/common/DataTable'
import { ImagePreview } from '@/components/common/ImagePreview'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchToolbar } from '@/components/common/SearchToolbar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePagedFilters } from '@/hooks/usePagedFilters'
import { formatDateTime } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { useChangeUserStatusMutation, useGetUsersQuery } from '../usersApi'
import type { AdminUser } from '../types'

export default function UsersPage() {
  usePageTitle('Users')
  const filters = usePagedFilters()
  const query = useGetUsersQuery(filters.params)
  const [changeStatus, statusState] = useChangeUserStatusMutation()
  const [selected, setSelected] = useState<AdminUser | null>(null)

  const confirm = async () => {
    if (!selected) return
    try {
      const response = await changeStatus(selected._id).unwrap()
      toast.success(response.message || 'User status updated.')
      setSelected(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to change status.'))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Directory"
        title="Users"
        description="Switch an account between active and suspended. The server toggles the status."
      />
      <SearchToolbar
        search={filters.searchInput}
        onSearch={filters.onSearchChange}
        placeholder="Search users"
        status={filters.status}
        onStatus={filters.onStatus}
        statusOptions={[
          { value: 'active', label: 'Active' },
          { value: 'delete', label: 'Suspended' },
        ]}
      />
      <DataTable<AdminUser>
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            render: (value: string, record) => (
              <span className="inline-flex items-center gap-3">
                <ImagePreview src={record.image} alt={value || 'User'} size={36} rounded="full" fallback={value} />
                <span className="font-medium">{value}</span>
              </span>
            ),
          },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Role', dataIndex: 'role' },
          { title: 'Lockers', dataIndex: 'locker_have', render: (value?: number) => value ?? 0 },
          { title: 'Status', dataIndex: 'status', render: (value: string) => <StatusBadge value={value} /> },
          { title: 'Joined', dataIndex: 'createdAt', render: (value: string) => formatDateTime(value) },
          {
            title: 'Account',
            key: 'actions',
            render: (_, record) => (
              <UserStatusToggle active={record.status === 'active'} onChange={() => setSelected(record)} />
            ),
          },
        ]}
        rows={query.data?.data ?? []}
        rowKey="_id"
        loading={query.isLoading || query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          total: query.data?.pagination?.total ?? 0,
          onChange: filters.onPageChange,
        }}
        emptyTitle="No users found"
        emptyDescription="Try a different search or status filter."
      />
      <ConfirmActionModal
        open={Boolean(selected)}
        title={selected?.status === 'active' ? 'Suspend user' : 'Activate user'}
        description={
          selected?.status === 'active'
            ? `Suspend ${selected.name || 'this user'}? They stay in the directory with a suspended status.`
            : `Activate ${selected?.name || 'this user'}?`
        }
        confirmLabel={selected?.status === 'active' ? 'Suspend' : 'Activate'}
        danger={selected?.status === 'active'}
        loading={statusState.isLoading}
        onConfirm={() => void confirm()}
        onCancel={() => setSelected(null)}
      />
    </div>
  )
}

function UserStatusToggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-canvas p-0.5" role="group" aria-label="Account status">
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-success text-white' : 'text-muted hover:text-ink'}`}
        aria-pressed={active}
        onClick={active ? undefined : onChange}
      >
        Active
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? 'text-muted hover:text-ink' : 'bg-ink text-white'}`}
        aria-pressed={!active}
        onClick={active ? onChange : undefined}
      >
        Suspend
      </button>
    </div>
  )
}
