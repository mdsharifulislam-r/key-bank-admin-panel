import { parseApiError } from './errors'

describe('API errors', () => {
  it('reads the server message and field errors', () => {
    const parsed = parseApiError({
      status: 400,
      data: {
        message: 'email must be an email',
        errors: { email: 'email must be an email', password: 'password must be longer than or equal to 8 characters' },
      },
    })
    expect(parsed.message).toBe('email must be an email')
    expect(parsed.fieldErrors.password).toContain('8 characters')
    expect(parsed.status).toBe(400)
  })

  it('explains a network failure without leaking a token', () => {
    const parsed = parseApiError({ status: 'FETCH_ERROR', error: 'TypeError' })
    expect(parsed.message).toMatch(/Unable to reach/)
    expect(parsed.message).not.toMatch(/token/i)
  })
})
