export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export interface SessionUser {
  id?: string
  name?: string
  email?: string
  role?: string
  image?: string
  contact?: string
}

export interface AuthSession {
  accessToken: string
  user: SessionUser
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false
  return ADMIN_ROLES.includes(role.toUpperCase() as (typeof ADMIN_ROLES)[number])
}

export function buildAuthHeader(token?: string | null): string | undefined {
  if (!token) return undefined
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

export function parseLoginSession(payload: unknown): AuthSession | null {
  if (typeof payload !== 'object' || payload === null || !('data' in payload)) return null
  const data = payload.data
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  const accessToken = readString(record, 'accessToken')
  if (!accessToken) return null
  return {
    accessToken,
    user: {
      id: readString(record, '_id') ?? readString(record, 'id'),
      name: readString(record, 'name'),
      email: readString(record, 'email'),
      role: readString(record, 'role'),
      image: readString(record, 'image'),
      contact: readString(record, 'contact'),
    },
  }
}

export function parseResetToken(payload: unknown, headerToken?: string | null): string | null {
  if (headerToken) {
    const cleaned = headerToken.replace(/^Bearer\s+/i, '').trim()
    if (cleaned) return cleaned
  }
  if (typeof payload !== 'object' || payload === null) return null
  const root = payload as Record<string, unknown>
  if (typeof root.data === 'string' && root.data.trim()) return root.data.trim()
  const sources = [root.data, root]
  for (const source of sources) {
    if (typeof source !== 'object' || source === null) continue
    const record = source as Record<string, unknown>
    for (const key of ['resetToken', 'accessToken', 'token']) {
      const value = readString(record, key)
      if (value) return value
    }
  }
  return null
}

export interface UserProfile {
  _id?: string
  name?: string
  last_name?: string
  email?: string
  contact?: string
  address?: string
  image?: string
  role?: string
  status?: string
}

export function parseProfile(payload: unknown): UserProfile | null {
  if (typeof payload !== 'object' || payload === null || !('data' in payload)) return null
  const data = payload.data
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  const nested = record.user
  const source =
    typeof nested === 'object' && nested !== null ? (nested as Record<string, unknown>) : record
  const profile: UserProfile = {
    _id: readString(source, '_id'),
    name: readString(source, 'name'),
    last_name: readString(source, 'last_name'),
    email: readString(source, 'email'),
    contact: readString(source, 'contact'),
    address: readString(source, 'address'),
    image: readString(source, 'image'),
    role: readString(source, 'role'),
    status: readString(source, 'status'),
  }
  if (!profile._id && !profile.email && !profile.name) return null
  return profile
}

export function profileToSession(profile: UserProfile): SessionUser {
  return {
    id: profile._id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    image: profile.image,
    contact: profile.contact,
  }
}
