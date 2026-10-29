function cleanUrl(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\/$/, '')
}

export const env = {
  apiBaseUrl: cleanUrl(import.meta.env.VITE_API_BASE_URL),
  socketUrl: cleanUrl(import.meta.env.VITE_SOCKET_URL),
}

export function getConfigError(): string | null {
  if (!env.apiBaseUrl) {
    return 'VITE_API_BASE_URL is missing. Copy .env.example to .env and set the API URL.'
  }
  if (!env.socketUrl) {
    return 'VITE_SOCKET_URL is missing. Copy .env.example to .env and set the Socket.IO URL.'
  }
  return null
}
