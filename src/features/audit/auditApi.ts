import { API_PATHS } from '@/config/paths'
import { cleanParams } from '@/lib/collections'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PageQuery } from '@/types/api'
import type { AuditLog } from './types'

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<ApiSuccess<AuditLog[]>, PageQuery>({
      query: (params) => ({
        url: API_PATHS.auditLogs,
        params: cleanParams(params),
      }),
      providesTags: ['AuditLogs'],
    }),
  }),
})

export const { useGetAuditLogsQuery } = auditApi
