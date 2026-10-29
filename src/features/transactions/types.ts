export interface TransactionOwner {
  _id?: string
  name?: string
  contact?: string
  email?: string
  image?: string
}

export interface Transaction {
  _id: string
  title?: string
  owner?: TransactionOwner | null
  trx_id?: string
  amount?: number
  discount?: number
  tax?: number
  platform_charge?: number
  booking?: { _id?: string; booking_id?: string } | null
  status?: string
  payment_status?: string
  prev_trx_id?: string | null
  type?: string
  createdAt?: string
}
