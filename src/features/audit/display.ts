import type { AuditLog } from './types'

const LOCKER_PATTERNS = [/Locker\s+No:\s*([A-Za-z0-9_-]+)/i, /Locker\s+([A-Za-z]*QSA\d+)/i]
const BOX_PATTERNS = [/Box\s+No:\s*([A-Za-z0-9_-]+)/i]

function present(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text || text.toLowerCase() === 'null') return null
  return text
}

function fromText(log: AuditLog, patterns: RegExp[]): string | null {
  const sources = [log.new_value, log.reason, log.action, log.old_value]
  for (const source of sources) {
    const text = present(source)
    if (!text) continue
    for (const pattern of patterns) {
      const match = text.match(pattern)
      const found = match?.[1]
      if (found) return found
    }
  }
  return null
}

export function auditLockerLabel(log: AuditLog): string {
  return present(log.locker_no) ?? fromText(log, LOCKER_PATTERNS) ?? '—'
}

export function auditBoxLabel(log: AuditLog): string {
  return present(log.box_no) ?? fromText(log, BOX_PATTERNS) ?? '—'
}
