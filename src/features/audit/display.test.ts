import { auditBoxLabel, auditLockerLabel } from './display'
import type { AuditLog } from './types'

const base: AuditLog = { _id: '1' }

describe('audit locker and box labels', () => {
  it('uses the dedicated fields when the server sends them', () => {
    const log: AuditLog = { ...base, locker_no: 'LQSA002011', box_no: '3' }
    expect(auditLockerLabel(log)).toBe('LQSA002011')
    expect(auditBoxLabel(log)).toBe('3')
  })

  it('reads locker and box numbers from the activity text', () => {
    const assigned: AuditLog = {
      ...base,
      locker_no: null,
      box_no: null,
      new_value: 'Locker No: LQSA002011 Box No: 3 assigned to joy by Shariful Islam',
    }
    const confirmed: AuditLog = {
      ...base,
      action: 'Locker SLQSA002001 booking has been confirmed by Shariful Islam.',
    }
    expect(auditLockerLabel(assigned)).toBe('LQSA002011')
    expect(auditBoxLabel(assigned)).toBe('3')
    expect(auditLockerLabel(confirmed)).toBe('SLQSA002001')
  })

  it('shows a dash when neither field nor text contains a value', () => {
    const log: AuditLog = { ...base, action: 'Report Status Changed', locker_no: null, box_no: null }
    expect(auditLockerLabel(log)).toBe('—')
    expect(auditBoxLabel(log)).toBe('—')
  })
})
