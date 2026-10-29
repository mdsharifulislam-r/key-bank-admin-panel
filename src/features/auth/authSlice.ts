import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthSession, SessionUser } from '@/lib/auth'
import { readPersistedSession } from './authStorage'

export interface AuthState {
  accessToken: string | null
  user: SessionUser | null
  resetEmail: string | null
  resetToken: string | null
}

const persisted = readPersistedSession()

const initialState: AuthState = {
  accessToken: persisted.accessToken,
  user: persisted.user,
  resetEmail: persisted.resetEmail,
  resetToken: persisted.resetToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<AuthSession>) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      state.resetEmail = null
      state.resetToken = null
    },
    profileLoaded(state, action: PayloadAction<SessionUser>) {
      state.user = { ...state.user, ...action.payload }
    },
    resetRequested(state, action: PayloadAction<string>) {
      state.resetEmail = action.payload
      state.resetToken = null
    },
    resetTokenReceived(state, action: PayloadAction<string>) {
      state.resetToken = action.payload
    },
    sessionCleared(state) {
      state.accessToken = null
      state.user = null
      state.resetEmail = null
      state.resetToken = null
    },
  },
})

export const { sessionStarted, profileLoaded, resetRequested, resetTokenReceived, sessionCleared } =
  authSlice.actions
export const authReducer = authSlice.reducer
