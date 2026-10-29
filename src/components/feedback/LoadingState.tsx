import { Skeleton } from 'antd'

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="surface-card p-6" aria-busy="true" aria-live="polite">
      <Skeleton active title paragraph={{ rows }} />
    </div>
  )
}
