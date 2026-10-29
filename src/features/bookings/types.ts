export interface BookingPerson {
  _id?: string
  name?: string
  contact?: string
  email?: string
  image?: string
}

export interface BookingLocker {
  _id?: string
  name?: string
  address?: string
}

export interface BookingPlan {
  _id?: string
  name?: string
  price?: number
}

export interface Booking {
  _id: string
  lockerNo?: string
  boxNo?: string
  size?: number
  pin?: string
  status?: string
  user?: BookingPerson
  locker?: BookingLocker
  price?: number
  booking_id?: string
  plan?: string | BookingPlan
  assigns?: unknown[]
  createdAt?: string
  updatedAt?: string
  buffer_time?: number
  end_date?: string
  start_date?: string
  payment_intent_id?: string
  smart_locker_order_id?: string
  cancel_at?: string
  cancel_reason?: string
  property_name?: string
}

export interface CancelBookingInput {
  id: string
  reason: string
}

export interface RefundBookingInput {
  id: string
  reason: string
  amount: number
}
