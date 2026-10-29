import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { API_PATHS } from '@/config/paths'
import { parseResetToken } from '@/lib/auth'
import { baseApi } from '@/services/baseApi'
import type { ApiSuccess } from '@/types/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  oneTimeCode: number
}

export interface VerifyOtpResult extends ApiSuccess<unknown> {
  resetToken: string | null
}

export interface ResetPasswordRequest {
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfileUpdateInput {
  name?: string
  email?: string
  contact?: string
  address?: string
  image?: File | null
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiSuccess<unknown>, LoginRequest>({
      query: (body) => ({ url: API_PATHS.login, method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<ApiSuccess<unknown>, ForgotPasswordRequest>({
      query: (body) => ({ url: API_PATHS.forgotPassword, method: 'POST', body }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResult, VerifyOtpRequest>({
      query: (body) => ({ url: API_PATHS.verifyOtp, method: 'POST', body }),
      transformResponse: (response: ApiSuccess<unknown>, meta: FetchBaseQueryMeta) => ({
        ...response,
        resetToken: parseResetToken(response, meta?.response?.headers.get('authorization')),
      }),
    }),
    resetPassword: builder.mutation<ApiSuccess<unknown>, ResetPasswordRequest>({
      query: (body) => ({ url: API_PATHS.resetPassword, method: 'POST', body }),
    }),
    changePassword: builder.mutation<ApiSuccess<unknown>, ChangePasswordRequest>({
      query: (body) => ({ url: API_PATHS.changePassword, method: 'POST', body }),
    }),
    getProfile: builder.query<ApiSuccess<unknown>, void>({
      query: () => API_PATHS.profile,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<ApiSuccess<unknown>, ProfileUpdateInput>({
      query: (input) => {
        const body = new FormData()
        if (input.name) body.append('name', input.name)
        if (input.email) body.append('email', input.email)
        if (input.contact) body.append('contact', input.contact)
        if (input.address) body.append('address', input.address)
        if (input.image) body.append('image', input.image)
        return { url: API_PATHS.profile, method: 'PATCH', body }
      },
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi
