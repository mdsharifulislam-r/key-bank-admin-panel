import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from 'antd'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppDispatch } from '@/app/hooks'
import { FormField } from '@/components/common/FormField'
import { isAdminRole, parseLoginSession } from '@/lib/auth'
import { getErrorMessage, parseApiError } from '@/lib/errors'
import { usePageTitle } from '@/hooks/usePageTitle'
import { AuthLayout } from '../components/AuthLayout'
import { sessionStarted } from '../authSlice'
import { useLoginMutation } from '../authApi'
import { loginSchema, type LoginValues } from '../schemas'

export default function LoginPage() {
  usePageTitle('Sign in')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const { control, handleSubmit, setError } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await login(values).unwrap()
      const session = parseLoginSession(response)
      if (!session) {
        toast.error('The server response did not include an access token.')
        return
      }
      if (!isAdminRole(session.user.role)) {
        toast.error('This account is not authorized for the admin panel.')
        return
      }
      dispatch(sessionStarted(session))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const parsed = parseApiError(error)
      if (parsed.fieldErrors.email) setError('email', { message: parsed.fieldErrors.email })
      if (parsed.fieldErrors.password) setError('password', { message: parsed.fieldErrors.password })
      toast.error(getErrorMessage(error, 'Unable to sign in.'))
    }
  })

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Use an administrator account. Customer accounts are turned away."
      footer={
        <Link to="/forgot-password" className="font-semibold text-gold-deep">
          Forgot password?
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <FormField label="Email" htmlFor="email" error={fieldState.error?.message}>
              <Input {...field} id="email" size="large" type="email" autoComplete="username" />
            </FormField>
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <FormField label="Password" htmlFor="password" error={fieldState.error?.message}>
              <Input.Password
                {...field}
                id="password"
                size="large"
                autoComplete="current-password"
                visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
              />
            </FormField>
          )}
        />
        <Button htmlType="submit" type="primary" size="large" block loading={isLoading}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
