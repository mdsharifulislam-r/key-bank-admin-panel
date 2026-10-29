export interface AdminUser {
  _id: string
  name: string
  role: string
  email: string
  status: string
  createdAt: string
  locker_have?: number
  image?: string
  contact?: string
}
