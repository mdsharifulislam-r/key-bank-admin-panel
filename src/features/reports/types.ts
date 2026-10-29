export const REPORT_STATUSES = ['Pending', 'Resolved', 'Rejected'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export interface ReportUser {
  _id?: string
  name?: string
  last_name?: string
  contact?: string
  email?: string
  image?: string
}

export interface Report {
  _id: string
  subject?: string
  message?: string
  attachments?: string[]
  status?: string
  user?: ReportUser
  createdAt?: string
  updatedAt?: string
}
