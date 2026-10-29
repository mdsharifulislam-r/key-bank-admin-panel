import type { SessionUser } from '@/lib/auth'

const SESSION_KEY = 'keybank.admin.session'

export interface PersistedSession {
  accessToken: string | null
  user: SessionUser | null
  resetEmail: string | null
  resetToken: string | null
}

const emptySession: PersistedSession = {
  accessToken: null,
  user: null,
  resetEmail: null,
  resetToken: null,
}

export function readPersistedSession(): PersistedSession {
  if (typeof sessionStorage === 'undefined') return emptySession
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return emptySession
    const parsed = JSON.parse(raw) as Partial<PersistedSession>
    return {
      accessToken: typeof parsed.accessToken === 'string' ? parsed.accessToken : null,
      user: parsed.user ?? null,
      resetEmail: typeof parsed.resetEmail === 'string' ? parsed.resetEmail : null,
      resetToken: typeof parsed.resetToken === 'string' ? parsed.resetToken : null,
    }
  } catch {
    return emptySession
  }
}

export function writePersistedSession(session: PersistedSession): void {
  if (typeof sessionStorage === 'undefined') return
  if (!session.accessToken && !session.resetEmail && !session.resetToken) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      accessToken: session.accessToken,
      user: session.user,
      resetEmail: session.resetEmail,
      resetToken: session.resetToken,
    }),
  )
}
