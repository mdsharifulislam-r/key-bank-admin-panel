import { API_PATHS } from '@/config/paths'
import { cleanParams } from '@/lib/collections'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PageQuery } from '@/types/api'
import type { Locker, LockerWriteInput } from './types'

function lockerFormData(input: LockerWriteInput): FormData {
  const body = new FormData()
  body.append('locker_id', input.locker_id)
  body.append('name', input.name)
  body.append('address', input.address)
  body.append('latitude', input.latitude)
  body.append('longitude', input.longitude)
  body.append('price', input.price)
  body.append('description', input.description)
  input.images?.forEach((image) => body.append('images', image))
  return body
}

export const lockersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLockers: builder.query<ApiSuccess<Locker[]>, PageQuery>({
      query: (params) => ({
        url: API_PATHS.lockers,
        params: cleanParams(params),
      }),
      providesTags: (result) => [
        { type: 'Lockers' as const, id: 'LIST' },
        ...(result?.data ?? []).map((locker) => ({ type: 'Lockers' as const, id: locker._id })),
      ],
    }),
    getLocker: builder.query<ApiSuccess<Locker>, string>({
      query: (lockerId) => API_PATHS.locker(lockerId),
      providesTags: (_result, _error, lockerId) => [{ type: 'Lockers', id: lockerId }],
    }),
    createLocker: builder.mutation<ApiSuccess<unknown>, LockerWriteInput>({
      query: (input) => ({
        url: API_PATHS.createLocker,
        method: 'POST',
        body: lockerFormData(input),
      }),
      invalidatesTags: [{ type: 'Lockers', id: 'LIST' }, 'Dashboard'],
    }),
    updateLocker: builder.mutation<ApiSuccess<unknown>, { id: string; input: LockerWriteInput }>({
      query: ({ id, input }) => ({
        url: API_PATHS.updateLocker(id),
        method: 'PATCH',
        body: lockerFormData(input),
      }),
      invalidatesTags: [{ type: 'Lockers', id: 'LIST' }],
    }),
    deleteLocker: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: API_PATHS.deleteLocker(id),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Lockers', id: 'LIST' }, 'Dashboard'],
    }),
  }),
})

export const {
  useGetLockersQuery,
  useGetLockerQuery,
  useCreateLockerMutation,
  useUpdateLockerMutation,
  useDeleteLockerMutation,
} = lockersApi
