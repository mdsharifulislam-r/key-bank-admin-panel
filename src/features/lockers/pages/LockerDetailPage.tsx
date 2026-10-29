import { Button } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { ImageGallery } from '@/components/common/ImagePreview'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getErrorMessage } from '@/lib/errors'
import { formatAmount, formatDateTime } from '@/lib/format'
import { useGetLockerQuery } from '../lockersApi'

export default function LockerDetailPage() {
  const { lockerId = '' } = useParams()
  usePageTitle(lockerId || 'Locker')
  const query = useGetLockerQuery(lockerId, { skip: !lockerId })
  const locker = query.data?.data
  const coordinates = locker?.location?.coordinates

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Lockers"
        title={locker?.name || lockerId}
        description={locker?.address}
        extra={
          <Link to="/lockers">
            <Button>Back to lockers</Button>
          </Link>
        }
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : null}
      {locker ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <div className="surface-card space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={locker.status} />
                <StatusBadge value={locker.availablity_status?.online ? 'active' : 'expired'} />
                <span className="text-sm text-muted">
                  {locker.availablity_status?.online ? 'Online' : 'Offline'}
                  {locker.availablity_status?.online_at ? ` · ${formatDateTime(locker.availablity_status.online_at)}` : ''}
                </span>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Locker ID" value={locker.locker_id} />
                <Detail label="Price" value={formatAmount(locker.price)} />
                <Detail label="Coordinates" value={coordinates ? `${coordinates[1]}, ${coordinates[0]}` : '—'} />
                <Detail label="Updated" value={formatDateTime(locker.updatedAt)} />
              </dl>
              <p className="text-sm leading-6 text-muted">{locker.description || 'No description was returned.'}</p>
            </div>
            <div className="surface-card p-3">
              <ImageGallery images={locker.locker_images} alt={locker.name || locker.locker_id} />
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">Compartments</h2>
            {locker.box_availability && locker.box_availability.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {locker.box_availability.map((box) => {
                  const ratio = box.total_count > 0 ? Math.round((box.available_count / box.total_count) * 100) : 0
                  return (
                    <article key={`${box.size}-${box.size_label}`} className="surface-card p-5">
                      <p className="text-sm font-medium text-muted">Size {box.size_label || box.size}</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">
                        {box.available_count}
                        <span className="text-base font-medium text-muted"> / {box.total_count} available</span>
                      </p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${ratio}%` }} />
                      </div>
                      {box.available_box_nos ? (
                        <p className="mt-3 text-xs leading-5 text-muted">
                          Open boxes: {box.available_box_nos.join(', ')}
                        </p>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="surface-card p-6 text-sm text-muted">This locker did not include compartment availability.</div>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
    </div>
  )
}
