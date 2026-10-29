export interface AppNotification {
  _id: string
  receiver?: string[]
  title: string
  message: string
  isRead: boolean
  readers?: string[]
  filePath?: string
  referenceId?: string
  createdAt: string
  updatedAt?: string
}

export function isNotification(value: unknown): value is AppNotification {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record._id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.message === 'string' &&
    typeof record.isRead === 'boolean' &&
    typeof record.createdAt === 'string'
  )
}

export function extractNotification(payload: unknown): AppNotification | null {
  if (isNotification(payload)) return payload
  if (typeof payload !== 'object' || payload === null) return null
  const record = payload as Record<string, unknown>
  for (const key of ['notification', 'data', 'payload']) {
    if (isNotification(record[key])) return record[key]
  }
  return null
}

export function acceptSocketNotification(seen: Set<string>, notification: AppNotification | null): notification is AppNotification {
  if (!notification) return false
  if (seen.has(notification._id)) return false
  seen.add(notification._id)
  return true
}

export function markNotificationRead<T extends { _id: string; isRead: boolean }>(items: T[], id: string): T[] {
  return items.map((item) => (item._id === id ? { ...item, isRead: true } : item))
}

export function markAllNotificationsRead<T extends { isRead: boolean }>(items: T[]): T[] {
  return items.map((item) => ({ ...item, isRead: true }))
}

export function countUnread<T extends { isRead: boolean }>(items: T[]): number {
  return items.reduce((total, item) => total + (item.isRead ? 0 : 1), 0)
}

export interface SocketLike {
  onAny: (listener: (event: string, ...args: unknown[]) => void) => void
  offAny: (listener: (event: string, ...args: unknown[]) => void) => void
}

export function bindSocketListener(
  socket: SocketLike,
  listener: (event: string, ...args: unknown[]) => void,
): () => void {
  socket.onAny(listener)
  return () => {
    socket.offAny(listener)
  }
}
