import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from 'antd'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { FormField } from '@/components/common/FormField'
import { getErrorMessage, parseApiError } from '@/lib/errors'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useResetPasswordMutation } from '../authApi'
import { AuthLayout } from '../components/AuthLayout'
import { sessionCleared } from '../authSlice'
import { resetSchema, type ResetValues } from '../schemas'

export default function ResetPasswordPage() {
  usePageTitle('Choose a password')
  const token = useAppSelector((state) => state.auth.resetToken)
  const email = useAppSelector((state) => state.auth.resetEmail)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const { control, handleSubmit, setError } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!token) navigate(email ? '/verify-otp' : '/forgot-password', { replace: true })
  }, [email, navigate, token])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await resetPassword(values).unwrap()
      dispatch(sessionCleared())
      toast.success(response.message || 'Password updated. Sign in with the new password.')
      navigate('/login', { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors.newPassword) setError('newPassword', { message: parsed.fieldErrors.newPassword })
      if (parsed.fieldErrors.confirmPassword) setError('confirmPassword', { message: parsed.fieldErrors.confirmPassword })
      toast.error(getErrorMessage(error, 'Unable to reset the password.'))
    }
  })

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least 8 characters. You will sign in again after this change."
      footer={
        <Link to="/login" className="font-semibold text-gold-deep">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <FormField label="New password" htmlFor="new-password" error={fieldState.error?.message}>
              <Input.Password {...field} id="new-password" size="large" autoComplete="new-password" />
            </FormField>
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <FormField label="Confirm password" htmlFor="confirm-password" error={fieldState.error?.message}>
              <Input.Password {...field} id="confirm-password" size="large" autoComplete="new-password" />
            </FormField>
          )}
        />
        <Button htmlType="submit" type="primary" size="large" block loading={isLoading}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  )
}
