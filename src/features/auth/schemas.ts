import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const otpSchema = z.object({
  oneTimeCode: z.coerce
    .number({ invalid_type_error: 'Enter the 4-digit code' })
    .int()
    .min(1000, 'The code must be 4 digits')
    .max(9999, 'The code must be 4 digits'),
})

export const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  contact: z.string().optional(),
  address: z.string().optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type EmailValues = z.infer<typeof emailSchema>
export type OtpValues = z.infer<typeof otpSchema>
export type ResetValues = z.infer<typeof resetSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type ProfileValues = z.infer<typeof profileSchema>
