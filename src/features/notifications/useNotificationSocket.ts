import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { acceptSocketNotification, bindSocketListener, extractNotification } from '@/lib/notifications'
import { connectSocket, disconnectSocket } from '@/services/socketClient'
import { notificationApi } from './notificationApi'
import { socketStatusChanged } from './notificationSlice'

export function useNotificationSocket() {
  const token = useAppSelector((state) => state.auth.accessToken)
  const dispatch = useAppDispatch()
  const seen = useRef(new Set<string>())

  useEffect(() => {
    if (!token) {
      disconnectSocket()
      dispatch(socketStatusChanged('idle'))
      return
    }

    const socket = connectSocket(token)
    if (!socket) {
      dispatch(socketStatusChanged('unavailable'))
      return
    }

    dispatch(socketStatusChanged(socket.connected ? 'connected' : 'connecting'))

    const onConnect = () => {
      dispatch(socketStatusChanged('connected'))
      dispatch(notificationApi.util.invalidateTags([{ type: 'Notifications', id: 'LIST' }]))
    }
    const onDisconnect = () => dispatch(socketStatusChanged('disconnected'))
    const onError = () => dispatch(socketStatusChanged('error'))

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onError)

    const unbind = bindSocketListener(socket, (_event, payload) => {
      const notification = extractNotification(payload)
      if (!acceptSocketNotification(seen.current, notification)) return
      dispatch(notificationApi.util.invalidateTags([{ type: 'Notifications', id: 'LIST' }]))
      toast.info(notification.title, { description: notification.message })
    })

    return () => {
      unbind()
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onError)
    }
  }, [dispatch, token])
}
