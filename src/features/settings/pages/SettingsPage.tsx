import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Tabs } from 'antd'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/hooks'
import { FormField } from '@/components/common/FormField'
import { ImageUpload } from '@/components/common/ImageUpload'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { changePasswordSchema, profileSchema, type ChangePasswordValues, type ProfileValues } from '@/features/auth/schemas'
import { useChangePasswordMutation, useGetProfileQuery, useUpdateProfileMutation } from '@/features/auth/authApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { parseProfile } from '@/lib/auth'
import { getErrorMessage } from '@/lib/errors'
import { LegalEditor } from '../components/LegalEditor'
import { DISCLAIMER_TYPES, useGetDisclaimerQuery, useSaveDisclaimerMutation, type DisclaimerType } from '../settingsApi'

const LEGAL_TITLES: Record<DisclaimerType, string> = {
  terms: 'Terms',
  privacy: 'Privacy',
  about: 'About us',
}

export default function SettingsPage() {
  usePageTitle('Settings')
  const session = useAppSelector((state) => state.auth.user)
  const profileQuery = useGetProfileQuery()
  const profile = parseProfile(profileQuery.data)
  const [updateProfile, updateState] = useUpdateProfileMutation()
  const [changePassword, passwordState] = useChangePasswordMutation()
  const [image, setImage] = useState<File | null>(null)
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || session?.name || '',
      email: profile?.email || session?.email || '',
      contact: profile?.contact || session?.contact || '',
      address: profile?.address || '',
    },
  })
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      const response = await updateProfile({ ...values, image }).unwrap()
      toast.success(response.message || 'Profile updated.')
      setImage(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update the profile.'))
    }
  })

  const savePassword = passwordForm.handleSubmit(async (values) => {
    try {
      const response = await changePassword(values).unwrap()
      toast.success(response.message || 'Password changed.')
      passwordForm.reset()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to change the password.'))
    }
  })

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Profile, password, and the legal content served by the disclaimer endpoint."
      />
      <Tabs
        items={[
          {
            key: 'profile',
            label: 'Profile',
            children: (
              <form className="surface-card max-w-xl space-y-4 p-5" onSubmit={saveProfile}>
                {profileQuery.isError ? <ErrorState message={getErrorMessage(profileQuery.error)} onRetry={() => void profileQuery.refetch()} /> : null}
                {profile?.last_name ? <p className="text-sm text-muted">Last name on file: {profile.last_name}</p> : null}
                <Controller name="name" control={profileForm.control} render={({ field, fieldState }) => (
                  <FormField label="Name" htmlFor="profile-name" error={fieldState.error?.message}><Input {...field} id="profile-name" /></FormField>
                )} />
                <Controller name="email" control={profileForm.control} render={({ field, fieldState }) => (
                  <FormField label="Email" htmlFor="profile-email" error={fieldState.error?.message}><Input {...field} id="profile-email" type="email" /></FormField>
                )} />
                <Controller name="contact" control={profileForm.control} render={({ field, fieldState }) => (
                  <FormField label="Contact" htmlFor="profile-contact" error={fieldState.error?.message}><Input {...field} id="profile-contact" /></FormField>
                )} />
                <Controller name="address" control={profileForm.control} render={({ field, fieldState }) => (
                  <FormField label="Address" htmlFor="profile-address" error={fieldState.error?.message}><Input {...field} id="profile-address" /></FormField>
                )} />
                <FormField label="Photo" htmlFor="profile-image">
                  <ImageUpload
                    id="profile-image"
                    files={image ? [image] : []}
                    existing={image ? [] : [profile?.image]}
                    onChange={(files) => setImage(files[0] ?? null)}
                  />
                </FormField>
                <Button type="primary" htmlType="submit" loading={updateState.isLoading}>Save profile</Button>
              </form>
            ),
          },
          {
            key: 'password',
            label: 'Password',
            children: (
              <form className="surface-card max-w-xl space-y-4 p-5" onSubmit={savePassword}>
                <Controller name="currentPassword" control={passwordForm.control} render={({ field, fieldState }) => (
                  <FormField label="Current password" htmlFor="current-password" error={fieldState.error?.message}><Input.Password {...field} id="current-password" /></FormField>
                )} />
                <Controller name="newPassword" control={passwordForm.control} render={({ field, fieldState }) => (
                  <FormField label="New password" htmlFor="settings-new-password" error={fieldState.error?.message}><Input.Password {...field} id="settings-new-password" /></FormField>
                )} />
                <Controller name="confirmPassword" control={passwordForm.control} render={({ field, fieldState }) => (
                  <FormField label="Confirm password" htmlFor="settings-confirm-password" error={fieldState.error?.message}><Input.Password {...field} id="settings-confirm-password" /></FormField>
                )} />
                <Button type="primary" htmlType="submit" loading={passwordState.isLoading}>Change password</Button>
              </form>
            ),
          },
          {
            key: 'legal',
            label: 'Legal content',
            children: (
              <div className="space-y-4">
                {DISCLAIMER_TYPES.map((type) => (
                  <DisclaimerCard key={type} type={type} />
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

function DisclaimerCard({ type }: { type: DisclaimerType }) {
  const query = useGetDisclaimerQuery(type)
  const initial = typeof query.data?.data === 'string' ? query.data.data : ''
  return <DisclaimerEditor key={`${type}:${initial}`} type={type} initial={initial} error={query.isError ? getErrorMessage(query.error) : null} />
}

function DisclaimerEditor({ type, initial, error }: { type: DisclaimerType; initial: string; error: string | null }) {
  const [save, saveState] = useSaveDisclaimerMutation()
  const readContent = useRef<() => string>(() => initial)
  const title = LEGAL_TITLES[type]

  return (
    <section className="surface-card space-y-3 p-5">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <LegalEditor
        value={initial}
        label={title}
        onReady={(read) => {
          readContent.current = read
        }}
      />
      <Button
        type="primary"
        loading={saveState.isLoading}
        onClick={() => {
          void save({ type, content: readContent.current() })
            .unwrap()
            .then((response) => toast.success(response.message || 'Content saved.'))
            .catch((saveError: unknown) => toast.error(getErrorMessage(saveError)))
        }}
      >
        Save {title.toLowerCase()}
      </Button>
    </section>
  )
}
