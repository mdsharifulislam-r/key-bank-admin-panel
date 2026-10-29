export interface LockerLocation {
  type?: string
  coordinates?: number[]
}

export interface LockerAvailability {
  online?: boolean
  online_at?: string | null
}

export interface BoxAvailability {
  size: number
  size_label?: string
  total_count: number
  available_count: number
  available_box_nos?: string[]
}

export interface Locker {
  _id: string
  locker_id: string
  name: string
  address: string
  location?: LockerLocation
  description?: string
  status?: string
  price?: number
  locker_images?: string[] | null
  createdAt?: string
  updatedAt?: string
  distance_in_km?: number | null
  availablity_status?: LockerAvailability
  box_availability?: BoxAvailability[]
}

export interface LockerWriteInput {
  locker_id: string
  name: string
  address: string
  latitude: string
  longitude: string
  price: string
  description: string
  images?: File[]
}
