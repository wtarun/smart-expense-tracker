import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function PrivateRoute() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner minHeight="100vh" />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
