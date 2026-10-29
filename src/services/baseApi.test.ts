import { authApi } from '@/features/auth/authApi'
import { usersApi } from '@/features/users/usersApi'
import { setupStore } from '@/app/store'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function firstRequest(fetchMock: ReturnType<typeof vi.fn>) {
  const request = fetchMock.mock.calls[0]?.[0]
  if (!(request instanceof Request)) {
    throw new Error('Expected fetch to receive a Request')
  }
  return request
}

describe('RTK Query requests', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
  })

  it('posts login credentials without an authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, message: 'ok', data: { accessToken: 't', role: 'ADMIN' } }))
    vi.stubGlobal('fetch', fetchMock)
    const store = setupStore({ auth: { accessToken: 'stale', user: null, resetEmail: null, resetToken: null } })

    await store.dispatch(authApi.endpoints.login.initiate({ email: 'admin@example.com', password: 'password1' }))

    const request = firstRequest(fetchMock)
    expect(request.url).toContain('/auth/login')
    expect(request.headers.get('Authorization')).toBeNull()
    expect(await request.clone().text()).toContain('admin@example.com')
  })

  it('sends the bearer token and list filters for users', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, message: 'ok', data: [], pagination: { total: 0, limit: 10, page: 1, totalPage: 0 } }))
    vi.stubGlobal('fetch', fetchMock)
    const store = setupStore({
      auth: { accessToken: 'token-1', user: { role: 'ADMIN' }, resetEmail: null, resetToken: null },
    })

    await store.dispatch(usersApi.endpoints.getUsers.initiate({ page: 2, limit: 10, searchTerm: 'jamal', status: 'active' }))

    const request = firstRequest(fetchMock)
    expect(request.url).toContain('/admin/users')
    expect(request.url).toContain('searchTerm=jamal')
    expect(request.url).toContain('status=active')
    expect(request.url).toContain('page=2')
    expect(request.headers.get('Authorization')).toBe('Bearer token-1')
  })

  it('clears the session when an authenticated request is rejected', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: false, message: 'jwt malformed' }, 401))
    vi.stubGlobal('fetch', fetchMock)
    const store = setupStore({
      auth: { accessToken: 'token-1', user: { role: 'ADMIN' }, resetEmail: null, resetToken: null },
    })

    await store.dispatch(usersApi.endpoints.getUsers.initiate({ page: 1, limit: 10 }))

    expect(store.getState().auth.accessToken).toBeNull()
  })
})
