import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error' | 'unavailable'

export interface NotificationUiState {
  socketStatus: SocketStatus
}

const initialState: NotificationUiState = {
  socketStatus: 'idle',
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    socketStatusChanged(state, action: PayloadAction<SocketStatus>) {
      state.socketStatus = action.payload
    },
  },
})

export const { socketStatusChanged } = notificationSlice.actions
export const notificationReducer = notificationSlice.reducer
