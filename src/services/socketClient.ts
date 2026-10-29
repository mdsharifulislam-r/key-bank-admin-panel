import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'

let socket: Socket | null = null

/**
 * The Postman collection does not document Socket.IO event names or an auth handshake.
 * The server at VITE_SOCKET_URL accepts Engine.IO v4 connections and emits nothing on connect.
 * The access token is sent in the handshake `auth.token` field because bearer tokens are the
 * only credential the HTTP API issues. Listeners must treat event names as unknown and only
 * react when a payload matches the notification resource returned by the HTTP API.
 */
export function connectSocket(token: string | null): Socket | null {
  if (!env.socketUrl) return null
  const auth = { token: token ?? undefined }
  if (socket) {
    socket.auth = auth
    if (!socket.connected) socket.connect()
    return socket
  }
  socket = io(env.socketUrl, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    auth,
    reconnection: true,
    reconnectionDelay: 1000,
    timeout: 10000,
  })
  return socket
}

export function disconnectSocket(): void {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}
