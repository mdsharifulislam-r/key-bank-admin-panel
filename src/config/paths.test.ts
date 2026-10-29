import { API_PATHS } from './paths'

describe('API paths', () => {
  it('uses the live forgot-password route', () => {
    expect(API_PATHS.forgotPassword).toBe('/auth/forgot-password')
  })

  it('builds notification and admin paths from the collection', () => {
    expect(API_PATHS.notifications).toBe('/communication/notification')
    expect(API_PATHS.markNotificationRead('abc')).toBe('/communication/notification/mark-as-read/abc')
    expect(API_PATHS.dashboardStats).toBe('/admin/dashboard/stats')
    expect(API_PATHS.changeUserStatus('user-1')).toBe('/admin/users/change-status/user-1')
  })
})
