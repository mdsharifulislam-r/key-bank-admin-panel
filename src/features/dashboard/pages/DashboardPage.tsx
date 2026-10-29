import { Button, Select } from 'antd'
import { CalendarClock, RefreshCw, Users, Vault, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useGetAuditLogsQuery } from '@/features/audit/auditApi'
import { auditBoxLabel, auditLockerLabel } from '@/features/audit/display'
import type { AuditLog } from '@/features/audit/types'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getErrorMessage } from '@/lib/errors'
import { formatAmount, formatCount, formatDateTime, personLabel, toMonthlyPoints } from '@/lib/format'
import { useGetDashboardStatsQuery, useGetRevenueStatisticsQuery, useGetUserStatisticsQuery } from '../dashboardApi'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, index) => currentYear - index)

export default function DashboardPage() {
  usePageTitle('Overview')
  const [year, setYear] = useState(currentYear)
  const stats = useGetDashboardStatsQuery()
  const users = useGetUserStatisticsQuery(year)
  const revenue = useGetRevenueStatisticsQuery(year)
  const activity = useGetAuditLogsQuery({ page: 1, limit: 6 })

  const userSeries = users.data?.data?.[String(year)]
  const revenueSeries = revenue.data?.data?.[String(year)]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Operations snapshot"
        description="Figures come directly from the admin statistics endpoints. Compartment availability is reported on each locker, not as a platform total."
        extra={
          <div className="flex items-center gap-2">
            <Select
              aria-label="Statistics year"
              value={year}
              options={years.map((value) => ({ value, label: String(value) }))}
              onChange={setYear}
              className="w-28"
            />
            <Button
              icon={<RefreshCw size={16} />}
              onClick={() => {
                void stats.refetch()
                void users.refetch()
                void revenue.refetch()
                void activity.refetch()
              }}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {stats.isLoading ? <LoadingState rows={2} /> : null}
      {stats.isError ? <ErrorState message={getErrorMessage(stats.error)} onRetry={() => void stats.refetch()} /> : null}
      {stats.data ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Users" value={formatCount(stats.data.data.totalUser)} icon={<Users size={18} />} />
          <StatCard label="Bookings" value={formatCount(stats.data.data.totalBooking)} icon={<CalendarClock size={18} />} />
          <StatCard label="Lockers" value={formatCount(stats.data.data.totalLocker)} icon={<Vault size={18} />} />
          <StatCard
            label="Revenue"
            value={formatAmount(stats.data.data.totalRevenue)}
            hint="Amount as returned by the API, without a currency code."
            icon={<Wallet size={18} />}
          />
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="User registrations"
          loading={users.isLoading}
          error={users.isError ? getErrorMessage(users.error) : null}
          onRetry={() => void users.refetch()}
          missing={!users.isLoading && !users.isError && !userSeries}
          data={toMonthlyPoints(userSeries)}
        />
        <ChartCard
          title="Revenue"
          loading={revenue.isLoading}
          error={revenue.isError ? getErrorMessage(revenue.error) : null}
          onRetry={() => void revenue.refetch()}
          missing={!revenue.isLoading && !revenue.isError && !revenueSeries}
          data={toMonthlyPoints(revenueSeries)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Recent activity</h2>
          <Link to="/audit-logs" className="text-sm font-semibold text-gold-deep">
            Open audit log
          </Link>
        </div>
        <DataTable<AuditLog>
          columns={[
            { title: 'When', dataIndex: 'createdAt', render: (value: string) => formatDateTime(value) },
            { title: 'Action', dataIndex: 'action', render: (value?: string) => value || '—' },
            { title: 'Locker', key: 'locker', render: (_value, record) => auditLockerLabel(record) },
            { title: 'Box', key: 'box', render: (_value, record) => auditBoxLabel(record) },
            { title: 'Person', dataIndex: 'user', render: (value: AuditLog['user']) => personLabel(value) },
            { title: 'Detail', dataIndex: 'reason', render: (value?: string) => value || '—' },
          ]}
          rows={activity.data?.data ?? []}
          rowKey="_id"
          loading={activity.isLoading}
          error={activity.error}
          onRetry={() => void activity.refetch()}
          pagination={null}
          emptyTitle="No audit activity"
          emptyDescription="Recent actions will appear when the audit log has entries."
        />
      </section>
    </div>
  )
}

function ChartCard({
  title,
  data,
  loading,
  error,
  missing,
  onRetry,
}: {
  title: string
  data: { month: string; value: number }[]
  loading: boolean
  error: string | null
  missing: boolean
  onRetry: () => void
}) {
  return (
    <section className="surface-card p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {loading ? <LoadingState rows={3} /> : null}
      {error ? <ErrorState message={error} onRetry={onRetry} /> : null}
      {missing ? (
        <p className="py-16 text-center text-sm text-muted">No monthly series was returned for this year.</p>
      ) : null}
      {!loading && !error && !missing ? (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#E7E9EE" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#737987', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#737987', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip cursor={{ fill: '#F5E9C8' }} />
              <Bar dataKey="value" fill="#C9961B" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  )
}
