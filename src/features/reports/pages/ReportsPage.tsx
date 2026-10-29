import { Button, Drawer, Select } from 'antd'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/common/DataTable'
import { ImageGallery, ImagePreview } from '@/components/common/ImagePreview'
import { isImageUrl } from '@/lib/images'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchToolbar } from '@/components/common/SearchToolbar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePagedFilters } from '@/hooks/usePagedFilters'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime, personLabel } from '@/lib/format'
import { useChangeReportStatusMutation, useGetReportsQuery } from '../reportsApi'
import { REPORT_STATUSES, type Report, type ReportStatus } from '../types'

export default function ReportsPage() {
  usePageTitle('Reports')
  const filters = usePagedFilters()
  const query = useGetReportsQuery(filters.params)
  const [changeStatus, statusState] = useChangeReportStatusMutation()
  const [selected, setSelected] = useState<Report | null>(null)
  const [status, setStatus] = useState<ReportStatus>('Pending')

  const openReport = (report: Report) => {
    setSelected(report)
    setStatus((REPORT_STATUSES.includes(report.status as ReportStatus) ? report.status : 'Pending') as ReportStatus)
  }

  const saveStatus = async () => {
    if (!selected) return
    try {
      const response = await changeStatus({ id: selected._id, status }).unwrap()
      toast.success(response.message || 'Report status updated.')
      setSelected(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update the report.'))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Support" title="Reports" description="Issues submitted by users. Status can be set to Pending, Resolved, or Rejected." />
      <SearchToolbar
        search={filters.searchInput}
        onSearch={filters.onSearchChange}
        placeholder="Search reports"
        status={filters.status}
        onStatus={filters.onStatus}
        statusOptions={REPORT_STATUSES.map((value) => ({ value, label: value }))}
      />
      <DataTable<Report>
        columns={[
          { title: 'Subject', dataIndex: 'subject', render: (value?: string) => value || '—' },
          { title: 'From', dataIndex: 'user', render: (value: Report['user']) => personLabel(value) },
          { title: 'Status', dataIndex: 'status', render: (value?: string) => <StatusBadge value={value} /> },
          { title: 'Received', dataIndex: 'createdAt', render: (value?: string) => formatDateTime(value) },
          { title: '', key: 'open', render: (_, record) => <Button type="link" onClick={() => openReport(record)}>Review</Button> },
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
        emptyTitle="No reports found"
      />
      <Drawer title="Report" open={Boolean(selected)} size={480} onClose={() => setSelected(null)} destroyOnHidden>
        {selected ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">Subject</p>
              <p className="mt-1 text-base font-semibold text-ink">{selected.subject || '—'}</p>
            </div>
            <p className="text-sm leading-6 text-ink">{selected.message || 'No message was included.'}</p>
            <div className="flex items-center gap-3">
              <ImagePreview src={selected.user?.image} alt={personLabel(selected.user)} size={40} rounded="full" fallback={personLabel(selected.user)} />
              <p className="text-sm text-muted">{personLabel(selected.user)} · {selected.user?.email}</p>
            </div>
            {selected.attachments && selected.attachments.some(isImageUrl) ? (
              <ImageGallery images={selected.attachments.filter(isImageUrl)} alt={selected.subject || 'Report attachment'} />
            ) : null}
            {selected.attachments?.filter((url) => !isImageUrl(url)).map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="block text-sm font-semibold text-gold-deep">
                Open attachment
              </a>
            ))}
            <div>
              <label htmlFor="report-status" className="mb-1.5 block text-sm font-medium">Status</label>
              <Select
                id="report-status"
                className="w-full"
                value={status}
                options={REPORT_STATUSES.map((value) => ({ value, label: value }))}
                onChange={setStatus}
              />
            </div>
            <Button type="primary" loading={statusState.isLoading} onClick={() => void saveStatus()}>
              Update status
            </Button>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
