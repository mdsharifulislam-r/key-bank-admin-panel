import { API_PATHS } from '@/config/paths'
import { cleanParams } from '@/lib/collections'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PageQuery } from '@/types/api'
import type { Report, ReportStatus } from './types'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<ApiSuccess<Report[]>, PageQuery>({
      query: (params) => ({
        url: API_PATHS.reports,
        params: cleanParams(params),
      }),
      providesTags: ['Reports'],
    }),
    changeReportStatus: builder.mutation<ApiSuccess<unknown>, { id: string; status: ReportStatus }>({
      query: ({ id, status }) => ({
        url: API_PATHS.reportStatus(id),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Reports', 'AuditLogs', 'Notifications'],
    }),
  }),
})

export const { useGetReportsQuery, useChangeReportStatusMutation } = reportsApi
