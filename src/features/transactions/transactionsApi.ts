import { API_PATHS } from '@/config/paths'
import { cleanParams } from '@/lib/collections'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess, PageQuery } from '@/types/api'
import type { Transaction } from './types'

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<ApiSuccess<Transaction[]>, PageQuery>({
      query: (params) => ({
        url: API_PATHS.transactions,
        params: cleanParams(params),
      }),
      providesTags: ['Transactions'],
    }),
  }),
})

export const { useGetTransactionsQuery } = transactionsApi
