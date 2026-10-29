import { Button } from 'antd'
import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'This section could not be loaded', message, onRetry }: ErrorStateProps) {
  return (
    <div className="surface-card flex flex-col items-start gap-3 p-6" role="alert">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-danger">
        <AlertTriangle size={18} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted">{message}</p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} type="primary">
          Try again
        </Button>
      ) : null}
    </div>
  )
}
