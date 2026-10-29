import { cleanup, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { setupStore } from '@/app/store'
import { ProtectedRoute } from './ProtectedRoute'

function renderGuard(token: string | null, role?: string) {
  const store = setupStore({
    auth: { accessToken: token, user: role ? { role } : null, resetEmail: null, resetToken: null },
  })
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/secure']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/secure" element={<h1>Secure desk</h1>} />
          </Route>
          <Route path="/login" element={<h1>Login screen</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

afterEach(() => {
  cleanup()
  sessionStorage.clear()
})

describe('protected routes', () => {
  it('shows the desk for an administrator session', () => {
    renderGuard('token-1', 'SUPER_ADMIN')
    expect(screen.getByRole('heading', { name: 'Secure desk' })).toBeInTheDocument()
  })

  it('sends anonymous visitors to the login screen', () => {
    renderGuard(null)
    expect(screen.getByRole('heading', { name: 'Login screen' })).toBeInTheDocument()
  })

  it('refuses a customer role', () => {
    renderGuard('token-1', 'USER')
    expect(screen.getByRole('heading', { name: 'Login screen' })).toBeInTheDocument()
  })
})
