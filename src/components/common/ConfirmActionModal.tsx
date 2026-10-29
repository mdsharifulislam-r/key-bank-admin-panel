import { Modal } from 'antd'
import type { ReactNode } from 'react'

interface ConfirmActionModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmActionModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      okText={confirmLabel}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okButtonProps={{ danger }}
      destroyOnHidden
    >
      <p className="text-sm leading-6 text-muted">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </Modal>
  )
}
