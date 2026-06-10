import { createContext, useCallback, useEffect, useState } from 'react'
import authApi from '../api/authApi'

export const AuthContext = createContext(null)

// ── Synchronous localStorage helpers ─────────────────────────────────────────
function readStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredUser(user) {
  if (user) localStorage.setItem('user', JSON.stringify(user))
  else       localStorage.removeItem('user')
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Initialise synchronously — no loading flash when a cached user exists
  const [user, setUser]       = useState(readStoredUser)
  const [loading, setLoading] = useState(() => {
    // Only block render if we have a token but no cached user yet
    return Boolean(localStorage.getItem('access_token')) && !readStoredUser()
  })

  const _setUser = useCallback((u) => {
    writeStoredUser(u)
    setUser(u)
  }, [])

  // ── Restore / validate session on mount ──────────────────────────────────
  useEffect(() => {
    const access = localStorage.getItem('access_token')
    if (!access) {
      _setUser(null)
      setLoading(false)
      return
    }

    // Silently refresh the cached user profile in the background
    authApi.me()
      .then(({ data }) => _setUser(data.data))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        _setUser(null)
      })
      .finally(() => setLoading(false))
  }, [_setUser])

  // ── Forced logout when token refresh fails ───────────────────────────────
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      _setUser(null)
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [_setUser])

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('access_token',  data.data.access)
    localStorage.setItem('refresh_token', data.data.refresh)
    _setUser(data.data.user)
  }, [_setUser])

  const register = useCallback(async (payload) => {
    await authApi.register(payload)
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) authApi.logout(refresh).catch(() => {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    _setUser(null)
  }, [_setUser])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
