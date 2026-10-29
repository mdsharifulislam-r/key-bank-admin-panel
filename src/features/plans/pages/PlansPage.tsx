import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Drawer, Input, Select } from 'antd'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmActionModal } from '@/components/common/ConfirmActionModal'
import { DataTable } from '@/components/common/DataTable'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatAmount } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { useCreatePlanMutation, useDeletePlanMutation, useGetPlansQuery, useUpdatePlanMutation } from '../plansApi'
import { PLAN_CYCLES, type Plan, type PlanCycle } from '../types'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Enter a price greater than 0'),
  recurring: z.enum(PLAN_CYCLES),
  bufferTime: z.coerce.number().int().min(0, 'Buffer time cannot be negative'),
  featuresText: z.string().min(1, 'Add at least one feature'),
})

type PlanForm = z.infer<typeof schema>

const defaults: PlanForm = {
  name: '',
  description: '',
  price: 0,
  recurring: 'monthly',
  bufferTime: 0,
  featuresText: '',
}

export default function PlansPage() {
  usePageTitle('Plans')
  const query = useGetPlansQuery()
  const [createPlan, createState] = useCreatePlanMutation()
  const [updatePlan, updateState] = useUpdatePlanMutation()
  const [deletePlan, deleteState] = useDeletePlanMutation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [removing, setRemoving] = useState<Plan | null>(null)
  const form = useForm<PlanForm>({ resolver: zodResolver(schema), defaultValues: defaults })

  const startCreate = () => {
    setEditing(null)
    form.reset(defaults)
    setOpen(true)
  }

  const startEdit = (plan: Plan) => {
    setEditing(plan)
    form.reset({
      name: plan.name,
      description: plan.description ?? '',
      price: plan.price,
      recurring: (PLAN_CYCLES.includes(plan.recurring as PlanCycle) ? plan.recurring : 'monthly') as PlanCycle,
      bufferTime: plan.bufferTime ?? 0,
      featuresText: (plan.features ?? []).join('\n'),
    })
    setOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const body = {
      name: values.name,
      description: values.description,
      price: values.price,
      recurring: values.recurring,
      bufferTime: values.bufferTime,
      features: values.featuresText.split('\n').map((item) => item.trim()).filter(Boolean),
    }
    try {
      const response = editing
        ? await updatePlan({ id: editing._id, body }).unwrap()
        : await createPlan(body).unwrap()
      toast.success(response.message || 'Plan saved.')
      setOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to save the plan.'))
    }
  })

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Finance"
        title="Plans"
        description="Booking plans used when a compartment is reserved."
        extra={<Button type="primary" onClick={startCreate}>New plan</Button>}
      />
      <DataTable<Plan>
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Price', dataIndex: 'price', render: (value: number) => formatAmount(value) },
          { title: 'Cycle', dataIndex: 'recurring' },
          { title: 'Buffer', dataIndex: 'bufferTime', render: (value?: number) => formatBufferDays(value) },
          { title: 'Status', dataIndex: 'status', render: (value?: string) => <StatusBadge value={value} /> },
          {
            title: '',
            key: 'actions',
            render: (_, record) => (
              <div className="flex">
                <Button type="link" onClick={() => startEdit(record)}>Edit</Button>
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
        pagination={null}
        emptyTitle="No plans yet"
      />
      <Drawer
        title={editing ? 'Edit plan' : 'New plan'}
        open={open}
        size={440}
        onClose={() => setOpen(false)}
        destroyOnHidden
        extra={<Button type="primary" loading={createState.isLoading || updateState.isLoading} onClick={() => void onSubmit()}>Save</Button>}
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <Controller name="name" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Name" htmlFor="plan-name" error={fieldState.error?.message}><Input {...field} id="plan-name" /></FormField>
          )} />
          <Controller name="description" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Description" htmlFor="plan-description" error={fieldState.error?.message}><Input.TextArea {...field} id="plan-description" rows={3} /></FormField>
          )} />
          <Controller name="price" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Price" htmlFor="plan-price" error={fieldState.error?.message}>
              <Input id="plan-price" value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
            </FormField>
          )} />
          <Controller name="recurring" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Cycle" htmlFor="plan-cycle" error={fieldState.error?.message}>
              <Select id="plan-cycle" className="w-full" value={field.value} onChange={field.onChange} options={PLAN_CYCLES.map((value) => ({ value, label: value }))} />
            </FormField>
          )} />
          <Controller name="bufferTime" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Buffer time (days)" htmlFor="plan-buffer" error={fieldState.error?.message}>
              <Input id="plan-buffer" value={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
            </FormField>
          )} />
          <Controller name="featuresText" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Features" htmlFor="plan-features" hint="One feature per line." error={fieldState.error?.message}>
              <Input.TextArea {...field} id="plan-features" rows={4} />
            </FormField>
          )} />
        </form>
      </Drawer>
      <ConfirmActionModal
        open={Boolean(removing)}
        title="Delete plan"
        description={`Delete ${removing?.name || 'this plan'}?`}
        confirmLabel="Delete"
        danger
        loading={deleteState.isLoading}
        onConfirm={() => {
          if (!removing) return
          void deletePlan(removing._id)
            .unwrap()
            .then((response) => {
              toast.success(response.message || 'Plan deleted.')
              setRemoving(null)
            })
            .catch((error: unknown) => toast.error(getErrorMessage(error)))
        }}
        onCancel={() => setRemoving(null)}
      />
    </div>
  )
}

function formatBufferDays(value?: number) {
  if (value === undefined || Number.isNaN(value)) return '—'
  return value === 1 ? '1 day' : `${value} days`
}
