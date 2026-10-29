import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { env } from '@/config/env'
import { sessionCleared } from '@/features/auth/authSlice'
import { buildAuthHeader } from '@/lib/auth'
import type { AuthState } from '@/features/auth/authSlice'

const PUBLIC_ENDPOINTS = new Set(['login', 'forgotPassword', 'verifyOtp'])

interface AuthRootState {
  auth: AuthState
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const auth = (getState() as AuthRootState).auth
    const token = endpoint === 'resetPassword' ? auth.resetToken : auth.accessToken
    if (!PUBLIC_ENDPOINTS.has(endpoint)) {
      const header = buildAuthHeader(token)
      if (header) headers.set('Authorization', header)
    }
    return headers
  },
})

export const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401 && !PUBLIC_ENDPOINTS.has(api.endpoint) && api.endpoint !== 'resetPassword') {
    api.dispatch(sessionCleared())
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'Profile',
    'Dashboard',
    'UserStats',
    'RevenueStats',
    'Users',
    'Lockers',
    'Bookings',
    'Transactions',
    'Plans',
    'Reports',
    'AuditLogs',
    'Faqs',
    'Disclaimers',
    'Notifications',
  ],
  endpoints: () => ({}),
})
