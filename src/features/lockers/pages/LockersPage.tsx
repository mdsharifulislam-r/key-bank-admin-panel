import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Drawer, Input } from 'antd'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmActionModal } from '@/components/common/ConfirmActionModal'
import { DataTable } from '@/components/common/DataTable'
import { FormField } from '@/components/common/FormField'
import { ImagePreview } from '@/components/common/ImagePreview'
import { ImageUpload } from '@/components/common/ImageUpload'
import { LocationPicker } from '@/components/common/LocationPicker'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchToolbar } from '@/components/common/SearchToolbar'
import { StatusBadge } from '@/components/common/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePagedFilters } from '@/hooks/usePagedFilters'
import { formatAmount } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { useCreateLockerMutation, useDeleteLockerMutation, useGetLockersQuery, useUpdateLockerMutation } from '../lockersApi'
import type { Locker } from '../types'

const lockerSchema = z.object({
  locker_id: z.string().min(1, 'Locker ID is required'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.string().refine((value) => Number.isFinite(Number(value)) && value !== '', 'Location is required — search an address or click the map'),
  longitude: z.string().refine((value) => Number.isFinite(Number(value)) && value !== '', 'Location is required — search an address or click the map'),
  price: z.string().refine((value) => Number(value) >= 0, 'Enter a price'),
  description: z.string().min(1, 'Description is required'),
})

type LockerFormValues = z.infer<typeof lockerSchema>

const emptyValues: LockerFormValues = {
  locker_id: '',
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  price: '',
  description: '',
}

export default function LockersPage() {
  usePageTitle('Lockers')
  const filters = usePagedFilters()
  const query = useGetLockersQuery(filters.params)
  const [createLocker, createState] = useCreateLockerMutation()
  const [updateLocker, updateState] = useUpdateLockerMutation()
  const [deleteLocker, deleteState] = useDeleteLockerMutation()
  const [editing, setEditing] = useState<Locker | null>(null)
  const [open, setOpen] = useState(false)
  const [removing, setRemoving] = useState<Locker | null>(null)
  const [images, setImages] = useState<File[]>([])
  const form = useForm<LockerFormValues>({ resolver: zodResolver(lockerSchema), defaultValues: emptyValues })

  const openCreate = () => {
    setEditing(null)
    setImages([])
    form.reset(emptyValues)
    setOpen(true)
  }

  const openEdit = (locker: Locker) => {
    const [longitude, latitude] = locker.location?.coordinates ?? []
    setEditing(locker)
    setImages([])
    form.reset({
      locker_id: locker.locker_id,
      name: locker.name,
      address: locker.address,
      latitude: latitude === undefined ? '' : String(latitude),
      longitude: longitude === undefined ? '' : String(longitude),
      price: locker.price === undefined ? '' : String(locker.price),
      description: locker.description ?? '',
    })
    setOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = { ...values, images }
      const response = editing
        ? await updateLocker({ id: editing._id, input: payload }).unwrap()
        : await createLocker(payload).unwrap()
      toast.success(response.message || (editing ? 'Locker updated.' : 'Locker created.'))
      setOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to save the locker.'))
    }
  })

  const confirmDelete = async () => {
    if (!removing) return
    try {
      const response = await deleteLocker(removing._id).unwrap()
      toast.success(response.message || 'Locker deleted.')
      setRemoving(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete the locker.'))
    }
  }

  // Watch location values to pass into LocationPicker
  const watchedAddress = form.watch('address')
  const watchedLatitude = form.watch('latitude')
  const watchedLongitude = form.watch('longitude')

  const handleLocationChange = (address: string, latitude: string, longitude: string) => {
    form.setValue('address', address, { shouldValidate: true })
    form.setValue('latitude', latitude, { shouldValidate: true })
    form.setValue('longitude', longitude, { shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations"
        title="Lockers"
        description="Create and maintain locker locations. Compartment counts are available on each locker detail page."
        extra={
          <Button type="primary" onClick={openCreate}>
            New locker
          </Button>
        }
      />
      <SearchToolbar
        search={filters.searchInput}
        onSearch={filters.onSearchChange}
        placeholder="Search lockers"
        status={filters.status}
        onStatus={filters.onStatus}
        statusOptions={[{ value: 'active', label: 'Active' }]}
      />
      <DataTable<Locker>
        columns={[
          {
            title: 'Photo',
            dataIndex: 'locker_images',
            render: (value: string[] | null | undefined, record) => (
              <ImagePreview src={value?.[0]} alt={record.name || record.locker_id} size={48} />
            ),
          },
          { title: 'Locker ID', dataIndex: 'locker_id', render: (value: string) => <Link className="font-semibold text-gold-deep" to={`/lockers/${encodeURIComponent(value)}`}>{value}</Link> },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Address', dataIndex: 'address' },
          { title: 'Price', dataIndex: 'price', render: (value?: number) => formatAmount(value) },
          { title: 'Status', dataIndex: 'status', render: (value?: string) => <StatusBadge value={value} /> },
          {
            title: '',
            key: 'actions',
            render: (_, record) => (
              <div className="flex gap-1">
                <Button type="link" onClick={() => openEdit(record)}>Edit</Button>
                <Button type="link" danger onClick={() => setRemoving(record)}>Delete</Button>
              </div>
            ),
          },
        ]}
        rows={query.data?.data ?? []}
        rowKey="_id"
        loading={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
        pagination={{
          page: filters.page,
          limit: filters.limit,
          total: query.data?.pagination?.total ?? 0,
          onChange: filters.onPageChange,
        }}
        emptyTitle="No lockers found"
      />

      <Drawer
        title={editing ? 'Edit locker' : 'New locker'}
        open={open}
        onClose={() => setOpen(false)}
        size={440}
        destroyOnHidden
        extra={
          <Button type="primary" loading={createState.isLoading || updateState.isLoading} onClick={() => void onSubmit()}>
            Save
          </Button>
        }
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Locker ID */}
          <Controller
            name="locker_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField label="Locker ID" htmlFor="locker_id" error={fieldState.error?.message}>
                <Input {...field} id="locker_id" />
              </FormField>
            )}
          />

          {/* Name */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField label="Name" htmlFor="name" error={fieldState.error?.message}>
                <Input {...field} id="name" />
              </FormField>
            )}
          />

          {/* Price */}
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField label="Price" htmlFor="price" error={fieldState.error?.message}>
                <Input {...field} id="price" />
              </FormField>
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormField label="Description" htmlFor="description" error={fieldState.error?.message}>
                <Input.TextArea {...field} id="description" rows={4} />
              </FormField>
            )}
          />

          {/* Location (address + map) */}
          <FormField
            label="Location"
            htmlFor="location-address-search"
            error={
              form.formState.errors.address?.message
              ?? form.formState.errors.latitude?.message
              ?? form.formState.errors.longitude?.message
            }
          >
            <LocationPicker
              address={watchedAddress}
              latitude={watchedLatitude}
              longitude={watchedLongitude}
              onChange={handleLocationChange}
            />
          </FormField>

          {/* Images */}
          <FormField label="Images" htmlFor="locker-images">
            <ImageUpload
              id="locker-images"
              multiple
              files={images}
              existing={editing?.locker_images}
              onChange={setImages}
            />
          </FormField>
        </form>
      </Drawer>

      <ConfirmActionModal
        open={Boolean(removing)}
        title="Delete locker"
        description={`Delete ${removing?.locker_id || 'this locker'}? This cannot be undone from the panel.`}
        confirmLabel="Delete locker"
        danger
        loading={deleteState.isLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setRemoving(null)}
      />
    </div>
  )
}
