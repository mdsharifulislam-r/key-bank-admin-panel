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
import { useVerifyOtpMutation } from '../authApi'
import { AuthLayout } from '../components/AuthLayout'
import { resetTokenReceived } from '../authSlice'
import { otpSchema, type OtpValues } from '../schemas'

export default function VerifyOtpPage() {
  usePageTitle('Verify code')
  const email = useAppSelector((state) => state.auth.resetEmail)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [verify, { isLoading }] = useVerifyOtpMutation()
  const { control, handleSubmit, setError } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { oneTimeCode: undefined as unknown as number },
  })

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  const onSubmit = handleSubmit(async (values) => {
    if (!email) return
    try {
      const response = await verify({ email, oneTimeCode: values.oneTimeCode }).unwrap()
      if (!response.resetToken) {
        toast.error('The server did not return a reset token, so the password cannot be changed yet.')
        return
      }
      dispatch(resetTokenReceived(response.resetToken))
      toast.success(response.message || 'Code verified.')
      navigate('/reset-password')
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors.oneTimeCode) setError('oneTimeCode', { message: parsed.fieldErrors.oneTimeCode })
      toast.error(getErrorMessage(error, 'Unable to verify that code.'))
    }
  })

  return (
    <AuthLayout
      title="Enter the code"
      subtitle={email ? `Sent to ${email}. The code is a number from 1000 to 9999.` : 'Request a new code to continue.'}
      footer={
        <Link to="/forgot-password" className="font-semibold text-gold-deep">
          Use a different email
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Controller
          name="oneTimeCode"
          control={control}
          render={({ field, fieldState }) => (
            <FormField label="One-time code" htmlFor="otp" error={fieldState.error?.message}>
              <Input
                id="otp"
                size="large"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={field.value ? String(field.value) : ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormField>
          )}
        />
        <Button htmlType="submit" type="primary" size="large" block loading={isLoading}>
          Verify code
        </Button>
      </form>
    </AuthLayout>
  )
}
