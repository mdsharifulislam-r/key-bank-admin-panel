import { API_PATHS } from '@/config/paths'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'

export const DISCLAIMER_TYPES = ['terms', 'privacy', 'about'] as const
export type DisclaimerType = (typeof DISCLAIMER_TYPES)[number]

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDisclaimer: builder.query<ApiSuccess<string>, DisclaimerType>({
      query: (type) => ({ url: API_PATHS.disclaimer, params: { type } }),
      providesTags: (_result, _error, type) => [{ type: 'Disclaimers', id: type }],
    }),
    saveDisclaimer: builder.mutation<ApiSuccess<unknown>, { type: DisclaimerType; content: string }>({
      query: (body) => ({ url: API_PATHS.disclaimer, method: 'POST', body }),
      invalidatesTags: (_result, _error, { type }) => [{ type: 'Disclaimers', id: type }],
    }),
  }),
})

export const { useGetDisclaimerQuery, useSaveDisclaimerMutation } = settingsApi
