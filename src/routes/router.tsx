import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage'
import VerifyOtpPage from '@/features/auth/pages/VerifyOtpPage'
import { GuestRoute } from './GuestRoute'
import {
  AuditLogsPage,
  BookingDetailPage,
  BookingsPage,
  DashboardPage,
  FaqsPage,
  LockerDetailPage,
  LockersPage,
  NotificationsPage,
  PlansPage,
  ReportsPage,
  SettingsPage,
  TransactionsPage,
  UsersPage,
} from './lazyPages'
import { NotFoundPage } from './NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/verify-otp', element: <VerifyOtpPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/lockers', element: <LockersPage /> },
          { path: '/lockers/:lockerId', element: <LockerDetailPage /> },
          { path: '/bookings', element: <BookingsPage /> },
          { path: '/bookings/:bookingId', element: <BookingDetailPage /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/transactions', element: <TransactionsPage /> },
          { path: '/plans', element: <PlansPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/faqs', element: <FaqsPage /> },
          { path: '/audit-logs', element: <AuditLogsPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
