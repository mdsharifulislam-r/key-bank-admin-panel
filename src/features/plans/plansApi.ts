import { API_PATHS } from '@/config/paths'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'
import type { Plan, PlanInput } from './types'

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<ApiSuccess<Plan[]>, void>({
      query: () => API_PATHS.plans,
      providesTags: ['Plans'],
    }),
    createPlan: builder.mutation<ApiSuccess<unknown>, PlanInput>({
      query: (body) => ({ url: API_PATHS.plans, method: 'POST', body }),
      invalidatesTags: ['Plans'],
    }),
    updatePlan: builder.mutation<ApiSuccess<unknown>, { id: string; body: PlanInput }>({
      query: ({ id, body }) => ({ url: API_PATHS.plan(id), method: 'PATCH', body }),
      invalidatesTags: ['Plans'],
    }),
    deletePlan: builder.mutation<ApiSuccess<unknown>, string>({
      query: (id) => ({ url: API_PATHS.plan(id), method: 'DELETE' }),
      invalidatesTags: ['Plans'],
    }),
  }),
})

export const { useGetPlansQuery, useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation } = plansApi
