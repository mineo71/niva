import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * Redirects already-authenticated users away from public-only pages
 * (login, signup) to the dashboard.
 */
export function PublicRoute() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
