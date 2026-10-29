import { buildAuthHeader, isAdminRole, parseLoginSession, parseResetToken } from './auth'

describe('administrator access', () => {
  it('accepts admin roles from the login contract', () => {
    expect(isAdminRole('ADMIN')).toBe(true)
    expect(isAdminRole('super_admin')).toBe(true)
    expect(isAdminRole('USER')).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
  })

  it('reads the access token and role from the login payload', () => {
    const session = parseLoginSession({
      success: true,
      data: { accessToken: 'token-1', role: 'SUPER_ADMIN', email: 'admin@example.com', name: 'Admin' },
    })
    expect(session).toEqual({
      accessToken: 'token-1',
      user: {
        id: undefined,
        name: 'Admin',
        email: 'admin@example.com',
        role: 'SUPER_ADMIN',
        image: undefined,
        contact: undefined,
      },
    })
  })

  it('rejects a login payload without an access token', () => {
    expect(parseLoginSession({ success: true, data: { role: 'ADMIN' } })).toBeNull()
  })
})

describe('reset token', () => {
  it('prefers the authorization header and then known body fields', () => {
    expect(parseResetToken({ data: { accessToken: 'body' } }, 'Bearer header-token')).toBe('header-token')
    expect(parseResetToken({ data: { resetToken: 'reset-1' } })).toBe('reset-1')
    expect(parseResetToken({ success: true, message: 'ok' })).toBeNull()
  })
})

describe('authorization header', () => {
  it('adds the bearer prefix once', () => {
    expect(buildAuthHeader('abc')).toBe('Bearer abc')
    expect(buildAuthHeader('Bearer abc')).toBe('Bearer abc')
    expect(buildAuthHeader(null)).toBeUndefined()
  })
})
