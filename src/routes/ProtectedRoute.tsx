import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { sessionCleared } from '@/features/auth/authSlice'
import { isAdminRole } from '@/lib/auth'

export function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.accessToken)
  const role = useAppSelector((state) => state.auth.user?.role)
  const dispatch = useAppDispatch()
  const location = useLocation()
  const allowed = Boolean(token) && (!role || isAdminRole(role))

  useEffect(() => {
    if (token && role && !isAdminRole(role)) dispatch(sessionCleared())
  }, [dispatch, role, token])

  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
