export interface AuditUser {
  _id?: string
  name?: string
  role?: string
  email?: string
  image?: string
}

export interface AuditLog {
  _id: string
  action?: string
  user?: AuditUser | null
  old_value?: string | null
  new_value?: string | null
  reference_id?: string | null
  reason?: string | null
  locker_no?: string | null
  box_no?: string | null
  booking?: string | null
  createdAt?: string
}
