export interface DashboardStats {
  totalUser: number
  totalBooking: number
  totalLocker: number
  totalRevenue: number
}

export type YearlySeries = Record<string, Record<string, number>>
