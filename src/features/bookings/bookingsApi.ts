import { API_PATHS } from '@/config/paths'
import { cleanParams } from '@/lib/collections'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PageQuery } from '@/types/api'
import type { Booking, CancelBookingInput, RefundBookingInput } from './types'

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<ApiSuccess<Booking[]>, PageQuery>({
      query: (params) => ({
        url: API_PATHS.bookings,
        params: cleanParams(params),
      }),
      providesTags: (result) => [
        { type: 'Bookings' as const, id: 'LIST' },
        ...(result?.data ?? []).map((booking) => ({ type: 'Bookings' as const, id: booking._id })),
      ],
    }),
    getBooking: builder.query<ApiSuccess<Booking>, string>({
      query: (id) => API_PATHS.booking(id),
      providesTags: (_result, _error, id) => [{ type: 'Bookings', id }],
    }),
    cancelBooking: builder.mutation<ApiSuccess<unknown>, CancelBookingInput>({
      query: ({ id, reason }) => ({
        url: API_PATHS.cancelBooking(id),
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Bookings', id: 'LIST' },
        { type: 'Bookings', id },
        'AuditLogs',
      ],
    }),
    refundBooking: builder.mutation<ApiSuccess<unknown>, RefundBookingInput>({
      query: ({ id, reason, amount }) => ({
        url: API_PATHS.refundBooking(id),
        method: 'PATCH',
        body: { reason, amount },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Bookings', id: 'LIST' },
        { type: 'Bookings', id },
        'Transactions',
        'Dashboard',
        'AuditLogs',
      ],
    }),
  }),
})

export const { useGetBookingsQuery, useGetBookingQuery, useCancelBookingMutation, useRefundBookingMutation } =
  bookingsApi
