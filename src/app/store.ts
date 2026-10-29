import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authReducer, type AuthState } from '@/features/auth/authSlice'
import { readPersistedSession, writePersistedSession } from '@/features/auth/authStorage'
import { notificationReducer, type NotificationUiState } from '@/features/notifications/notificationSlice'
import { baseApi } from '@/services/baseApi'
import { disconnectSocket } from '@/services/socketClient'
import '@/features/auth/authApi'
import '@/features/notifications/notificationApi'
import '@/features/dashboard/dashboardApi'
import '@/features/users/usersApi'
import '@/features/lockers/lockersApi'
import '@/features/bookings/bookingsApi'
import '@/features/transactions/transactionsApi'
import '@/features/plans/plansApi'
import '@/features/reports/reportsApi'
import '@/features/audit/auditApi'
import '@/features/faq/faqApi'
import '@/features/settings/settingsApi'

export interface StorePreload {
  auth: AuthState
  notifications: NotificationUiState
}

export function setupStore(preloadedState?: Partial<StorePreload>) {
  const persisted = readPersistedSession()
  const store = configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    preloadedState: {
      auth: preloadedState?.auth ?? {
        accessToken: persisted.accessToken,
        user: persisted.user,
        resetEmail: persisted.resetEmail,
        resetToken: persisted.resetToken,
      },
      notifications: preloadedState?.notifications ?? { socketStatus: 'idle' },
    },
  })

  let previousToken = store.getState().auth.accessToken
  let authSnapshot = JSON.stringify(store.getState().auth)
  let clearing = false

  store.subscribe(() => {
    const auth = store.getState().auth
    const snapshot = JSON.stringify(auth)
    if (snapshot !== authSnapshot) {
      authSnapshot = snapshot
      writePersistedSession(auth)
    }
    const loggedOut = Boolean(previousToken) && !auth.accessToken
    previousToken = auth.accessToken
    if (loggedOut && !clearing) {
      clearing = true
      disconnectSocket()
      store.dispatch(baseApi.util.resetApiState())
      clearing = false
    }
  })

  return store
}

export const store = setupStore()
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
