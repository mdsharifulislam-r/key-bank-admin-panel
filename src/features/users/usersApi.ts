import { API_PATHS } from '@/config/paths'
import { cleanParams } from '@/lib/collections'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PageQuery } from '@/types/api'
import type { AdminUser } from './types'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ApiSuccess<AdminUser[]>, PageQuery>({
      query: (params) => ({
        url: API_PATHS.users,
        params: cleanParams(params),
      }),
      providesTags: (result) => [
        { type: 'Users' as const, id: 'LIST' },
        ...(result?.data ?? []).map((user) => ({ type: 'Users' as const, id: user._id })),
      ],
    }),
    changeUserStatus: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({
        url: API_PATHS.changeUserStatus(id),
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),
  }),
})

export const { useGetUsersQuery, useChangeUserStatusMutation } = usersApi
