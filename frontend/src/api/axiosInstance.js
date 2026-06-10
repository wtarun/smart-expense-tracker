import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach access token ──────────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: refresh on 401 ──────────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return axiosInstance(original)
        })
        .catch((err) => Promise.reject(err))
    }

    original._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      isRefreshing = false
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post('/api/v1/auth/token/refresh/', {
        refresh: refreshToken,
      })
      const newAccess = data.data.access
      localStorage.setItem('access_token', newAccess)
      if (data.data.refresh) localStorage.setItem('refresh_token', data.data.refresh)

      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccess}`
      processQueue(null, newAccess)
      original.headers.Authorization = `Bearer ${newAccess}`
      return axiosInstance(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
