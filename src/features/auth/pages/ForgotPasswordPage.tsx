import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/hooks'
import { FormField } from '@/components/common/FormField'
import { getErrorMessage, parseApiError } from '@/lib/errors'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useForgotPasswordMutation } from '../authApi'
import { AuthLayout } from '../components/AuthLayout'
import { resetRequested } from '../authSlice'
import { emailSchema, type EmailValues } from '../schemas'

export default function ForgotPasswordPage() {
  usePageTitle('Forgot password')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [forgot, { isLoading }] = useForgotPasswordMutation()
  const { control, handleSubmit, setError } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await forgot(values).unwrap()
      dispatch(resetRequested(values.email))
      toast.success(response.message || 'Check your email for a verification code.')
      navigate('/verify-otp')
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors.email) setError('email', { message: parsed.fieldErrors.email })
      toast.error(getErrorMessage(error, 'Unable to send a reset code.'))
    }
  })

  return (
    <AuthLayout
      title="Reset access"
      subtitle="We will send a one-time code to the administrator email on file."
      footer={
        <Link to="/login" className="font-semibold text-gold-deep">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <FormField label="Email" htmlFor="reset-email" error={fieldState.error?.message}>
              <Input {...field} id="reset-email" size="large" type="email" autoComplete="username" />
            </FormField>
          )}
        />
        <Button htmlType="submit" type="primary" size="large" block loading={isLoading}>
          Send code
        </Button>
      </form>
    </AuthLayout>
  )
}
