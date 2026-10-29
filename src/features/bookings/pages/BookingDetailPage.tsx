import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { Button, Input } from 'antd'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormField } from '@/components/common/FormField'
import { ImagePreview } from '@/components/common/ImagePreview'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getErrorMessage } from '@/lib/errors'
import { formatAmount, formatDateTime, personLabel } from '@/lib/format'
import { useCancelBookingMutation, useGetBookingQuery, useRefundBookingMutation } from '../bookingsApi'
import type { BookingPlan } from '../types'

const cancelSchema = z.object({ reason: z.string().min(1, 'A reason is required') })
const refundSchema = cancelSchema.extend({
  amount: z.coerce.number().positive('Enter an amount greater than 0'),
})

export default function BookingDetailPage() {
  const { bookingId = '' } = useParams()
  usePageTitle('Booking')
  const query = useGetBookingQuery(bookingId, { skip: !bookingId })
  const [cancelBooking, cancelState] = useCancelBookingMutation()
  const [refundBooking, refundState] = useRefundBookingMutation()
  const [mode, setMode] = useState<'cancel' | 'refund' | null>(null)
  const [showPin, setShowPin] = useState(false)
  const booking = query.data?.data
  const cancelForm = useForm<{ reason: string }>({ resolver: zodResolver(cancelSchema), defaultValues: { reason: '' } })
  const refundForm = useForm<{ reason: string; amount: number }>({
    resolver: zodResolver(refundSchema),
    defaultValues: { reason: '', amount: undefined as unknown as number },
  })

  const submitCancel = cancelForm.handleSubmit(async (values) => {
    try {
      const response = await cancelBooking({ id: bookingId, reason: values.reason }).unwrap()
      toast.success(response.message || 'Booking cancelled.')
      setMode(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to cancel the booking.'))
    }
  })

  const submitRefund = refundForm.handleSubmit(async (values) => {
    try {
      const response = await refundBooking({ id: bookingId, reason: values.reason, amount: values.amount }).unwrap()
      toast.success(response.message || 'Refund submitted.')
      setMode(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to refund the booking.'))
    }
  })

  const plan = booking?.plan
  const planLabel = typeof plan === 'string' ? plan : planName(plan)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Bookings"
        title={booking?.booking_id || 'Booking'}
        description={booking?.locker?.address || booking?.lockerNo}
        extra={
          <div className="flex gap-2">
            <Link to="/bookings"><Button>All bookings</Button></Link>
            <Button onClick={() => setMode('cancel')}>Cancel</Button>
            <Button type="primary" onClick={() => setMode('refund')}>Refund</Button>
          </div>
        }
      />
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : null}
      {booking ? (
        <section className="surface-card grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Status" value={<StatusBadge value={booking.status} />} />
          <Field
            label="User"
            value={
              <span className="inline-flex items-center gap-2">
                <ImagePreview src={booking.user?.image} alt={personLabel(booking.user)} size={28} rounded="full" fallback={personLabel(booking.user)} />
                <span>{personLabel(booking.user)}</span>
              </span>
            }
          />
          <Field label="Email" value={booking.user?.email || '—'} />
          <Field label="Locker" value={booking.locker?.name || booking.lockerNo || '—'} />
          <Field label="Box" value={booking.boxNo || '—'} />
          <Field label="Size" value={booking.size ? String(booking.size) : '—'} />
          <Field label="Amount" value={formatAmount(booking.price)} />
          <Field label="Plan" value={planLabel} />
          <Field label="Property" value={booking.property_name || '—'} />
          <Field
            label="Pickup PIN"
            value={
              <span className="inline-flex items-center gap-2">
                <span className="font-mono">{showPin ? booking.pin || '—' : '••••••'}</span>
                <Button type="link" size="small" onClick={() => setShowPin((value) => !value)}>
                  {showPin ? 'Hide' : 'Show'}
                </Button>
              </span>
            }
          />
          <Field label="Starts" value={formatDateTime(booking.start_date)} />
          <Field label="Ends" value={formatDateTime(booking.end_date)} />
          <Field label="Created" value={formatDateTime(booking.createdAt)} />
          <Field label="Order" value={booking.smart_locker_order_id || '—'} />
          <Field label="Cancel reason" value={booking.cancel_reason || '—'} />
        </section>
      ) : null}

      {mode === 'cancel' ? (
        <form className="surface-card max-w-xl space-y-4 p-5" onSubmit={submitCancel}>
          <h2 className="text-base font-semibold">Cancel booking</h2>
          <Controller
            name="reason"
            control={cancelForm.control}
            render={({ field, fieldState }) => (
              <FormField label="Reason" htmlFor="cancel-reason" error={fieldState.error?.message}>
                <Input.TextArea {...field} id="cancel-reason" rows={3} />
              </FormField>
            )}
          />
          <div className="flex gap-2">
            <Button htmlType="submit" danger type="primary" loading={cancelState.isLoading}>Confirm cancel</Button>
            <Button onClick={() => setMode(null)}>Close</Button>
          </div>
        </form>
      ) : null}

      {mode === 'refund' ? (
        <form className="surface-card max-w-xl space-y-4 p-5" onSubmit={submitRefund}>
          <h2 className="text-base font-semibold">Refund booking</h2>
          <Controller
            name="amount"
            control={refundForm.control}
            render={({ field, fieldState }) => (
              <FormField label="Amount" htmlFor="refund-amount" error={fieldState.error?.message}>
                <Input
                  id="refund-amount"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormField>
            )}
          />
          <Controller
            name="reason"
            control={refundForm.control}
            render={({ field, fieldState }) => (
              <FormField label="Reason" htmlFor="refund-reason" error={fieldState.error?.message}>
                <Input.TextArea {...field} id="refund-reason" rows={3} />
              </FormField>
            )}
          />
          <div className="flex gap-2">
            <Button htmlType="submit" type="primary" loading={refundState.isLoading}>Submit refund</Button>
            <Button onClick={() => setMode(null)}>Close</Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

function planName(plan?: BookingPlan) {
  if (!plan) return '—'
  return plan.name || plan._id || '—'
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  )
}
