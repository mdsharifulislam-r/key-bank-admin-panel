import {
  acceptSocketNotification,
  bindSocketListener,
  countUnread,
  extractNotification,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from './notifications'

const notification: AppNotification = {
  _id: 'n1',
  title: 'New report',
  message: 'A user sent a report',
  isRead: false,
  createdAt: '2026-10-24T00:00:00.000Z',
  filePath: 'report',
}

describe('notification read state', () => {
  it('marks one notification read and counts the remainder', () => {
    const second = { ...notification, _id: 'n2' }
    const next = markNotificationRead([notification, second], 'n1')
    expect(next[0]?.isRead).toBe(true)
    expect(next[1]?.isRead).toBe(false)
    expect(countUnread(next)).toBe(1)
    expect(countUnread(markAllNotificationsRead(next))).toBe(0)
  })
})

describe('socket notifications', () => {
  it('accepts a matching payload once and ignores unknown events', () => {
    const seen = new Set<string>()
    expect(extractNotification({ event: 'ping' })).toBeNull()
    expect(acceptSocketNotification(seen, extractNotification({ notification }))).toBe(true)
    expect(acceptSocketNotification(seen, notification)).toBe(false)
  })

  it('removes the listener on cleanup', () => {
    const listeners = new Set<(event: string, ...args: unknown[]) => void>()
    const socket = {
      onAny: (listener: (event: string, ...args: unknown[]) => void) => listeners.add(listener),
      offAny: (listener: (event: string, ...args: unknown[]) => void) => listeners.delete(listener),
    }
    const cleanup = bindSocketListener(socket, () => undefined)
    expect(listeners.size).toBe(1)
    cleanup()
    expect(listeners.size).toBe(0)
  })
})
