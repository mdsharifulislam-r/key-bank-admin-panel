import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { isAdminRole } from '@/lib/auth'

export function GuestRoute() {
  const token = useAppSelector((state) => state.auth.accessToken)
  const role = useAppSelector((state) => state.auth.user?.role)
  if (token && (!role || isAdminRole(role))) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
