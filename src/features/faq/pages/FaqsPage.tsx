import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Drawer, Input } from 'antd'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ConfirmActionModal } from '@/components/common/ConfirmActionModal'
import { DataTable } from '@/components/common/DataTable'
import { FormField } from '@/components/common/FormField'
import { PageHeader } from '@/components/common/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getErrorMessage } from '@/lib/errors'
import { useCreateFaqMutation, useDeleteFaqMutation, useGetFaqsQuery, useUpdateFaqMutation } from '../faqApi'
import type { Faq } from '../types'

const schema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
})

type FaqForm = z.infer<typeof schema>

export default function FaqsPage() {
  usePageTitle('FAQs')
  const query = useGetFaqsQuery()
  const [createFaq, createState] = useCreateFaqMutation()
  const [updateFaq, updateState] = useUpdateFaqMutation()
  const [deleteFaq, deleteState] = useDeleteFaqMutation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [removing, setRemoving] = useState<Faq | null>(null)
  const form = useForm<FaqForm>({ resolver: zodResolver(schema), defaultValues: { question: '', answer: '' } })

  const start = (faq?: Faq) => {
    setEditing(faq ?? null)
    form.reset({ question: faq?.question ?? '', answer: faq?.answer ?? '' })
    setOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = editing
        ? await updateFaq({ id: editing._id, body: values }).unwrap()
        : await createFaq(values).unwrap()
      toast.success(response.message || 'FAQ saved.')
      setOpen(false)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to save the FAQ.'))
    }
  })

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Support" title="FAQs" description="Questions shown to people using Keybank." extra={<Button type="primary" onClick={() => start()}>New FAQ</Button>} />
      <DataTable<Faq>
        columns={[
          { title: 'Question', dataIndex: 'question' },
          { title: 'Answer', dataIndex: 'answer', ellipsis: true },
          {
            title: '',
            key: 'actions',
            render: (_, record) => (
              <div className="flex">
                <Button type="link" onClick={() => start(record)}>Edit</Button>
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
        emptyTitle="No FAQs yet"
      />
      <Drawer title={editing ? 'Edit FAQ' : 'New FAQ'} open={open} size={440} onClose={() => setOpen(false)} destroyOnHidden extra={<Button type="primary" loading={createState.isLoading || updateState.isLoading} onClick={() => void onSubmit()}>Save</Button>}>
        <form className="space-y-4" onSubmit={onSubmit}>
          <Controller name="question" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Question" htmlFor="faq-question" error={fieldState.error?.message}><Input {...field} id="faq-question" /></FormField>
          )} />
          <Controller name="answer" control={form.control} render={({ field, fieldState }) => (
            <FormField label="Answer" htmlFor="faq-answer" error={fieldState.error?.message}><Input.TextArea {...field} id="faq-answer" rows={5} /></FormField>
          )} />
        </form>
      </Drawer>
      <ConfirmActionModal
        open={Boolean(removing)}
        title="Delete FAQ"
        description="This removes the question from the list."
        confirmLabel="Delete"
        danger
        loading={deleteState.isLoading}
        onConfirm={() => {
          if (!removing) return
          void deleteFaq(removing._id).unwrap().then((response) => {
            toast.success(response.message || 'FAQ deleted.')
            setRemoving(null)
          }).catch((error: unknown) => toast.error(getErrorMessage(error)))
        }}
        onCancel={() => setRemoving(null)}
      />
    </div>
  )
}
