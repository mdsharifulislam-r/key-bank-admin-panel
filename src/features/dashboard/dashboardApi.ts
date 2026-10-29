import { API_PATHS } from '@/config/paths'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'
import type { DashboardStats, YearlySeries } from './types'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiSuccess<DashboardStats>, void>({
      query: () => API_PATHS.dashboardStats,
      providesTags: ['Dashboard'],
    }),
    getUserStatistics: builder.query<ApiSuccess<YearlySeries>, number>({
      query: (year) => ({ url: API_PATHS.userStatistics, params: { year } }),
      providesTags: ['UserStats'],
    }),
    getRevenueStatistics: builder.query<ApiSuccess<YearlySeries>, number>({
      query: (year) => ({ url: API_PATHS.revenueStatistics, params: { year } }),
      providesTags: ['RevenueStats'],
    }),
  }),
})

export const { useGetDashboardStatsQuery, useGetUserStatisticsQuery, useGetRevenueStatisticsQuery } = dashboardApi
