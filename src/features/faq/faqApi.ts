import { API_PATHS } from '@/config/paths'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'
import type { Faq, FaqInput } from './types'

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<ApiSuccess<Faq[]>, void>({
      query: () => API_PATHS.faqs,
      providesTags: ['Faqs'],
    }),
    createFaq: builder.mutation<ApiSuccess<unknown>, FaqInput>({
      query: (body) => ({ url: API_PATHS.faqs, method: 'POST', body }),
      invalidatesTags: ['Faqs'],
    }),
    updateFaq: builder.mutation<ApiSuccess<unknown>, { id: string; body: FaqInput }>({
      query: ({ id, body }) => ({ url: API_PATHS.faq(id), method: 'PATCH', body }),
      invalidatesTags: ['Faqs'],
    }),
    deleteFaq: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({ url: API_PATHS.faq(id), method: 'DELETE' }),
      invalidatesTags: ['Faqs'],
    }),
  }),
})

export const { useGetFaqsQuery, useCreateFaqMutation, useUpdateFaqMutation, useDeleteFaqMutation } = faqApi
