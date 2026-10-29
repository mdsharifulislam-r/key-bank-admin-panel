export interface PaginationMeta {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface ApiSuccess<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  pagination?: PaginationMeta
}

export interface PageQuery {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

export interface ApiErrorBody {
  success?: boolean
  statusCode?: number
  message?: string
  errors?: Record<string, string>
  timestamp?: string
  path?: string
}
