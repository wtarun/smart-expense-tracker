import { createContext, useCallback, useEffect, useState } from 'react'
import authApi from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)   // true while restoring session

  // ── Restore session on mount ──────────────────────────────────────────
  useEffect(() => {
    const access = localStorage.getItem('access_token')
    if (!access) { setLoading(false); return }

    authApi.me()
      .then(({ data }) => setUser(data.data))
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Listen for forced logout (token refresh failed) ───────────────────
  useEffect(() => {
    const handler = () => {
      setUser(null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('access_token',  data.data.access)
    localStorage.setItem('refresh_token', data.data.refresh)
    setUser(data.data.user)
  }, [])

  const register = useCallback(async (payload) => {
    await authApi.register(payload)
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) authApi.logout(refresh).catch(() => {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
