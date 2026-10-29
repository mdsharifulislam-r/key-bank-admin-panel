import type { ApiErrorBody } from '@/types/api'

export interface ParsedApiError {
  message: string
  fieldErrors: Record<string, string>
  status?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readErrorBody(data: unknown): ApiErrorBody | null {
  if (!isRecord(data)) return null
  const errors: Record<string, string> = {}
  if (isRecord(data.errors)) {
    for (const [key, value] of Object.entries(data.errors)) {
      if (typeof value === 'string') errors[key] = value
    }
  }
  return {
    message: typeof data.message === 'string' ? data.message : undefined,
    statusCode: typeof data.statusCode === 'number' ? data.statusCode : undefined,
    errors,
  }
}

export function parseApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): ParsedApiError {
  if (!isRecord(error)) {
    return { message: fallback, fieldErrors: {} }
  }

  if (error.status === 'FETCH_ERROR') {
    return {
      message: 'Unable to reach the Keybank server. Check the connection and API URL.',
      fieldErrors: {},
    }
  }

  const body = readErrorBody(error.data)
  const status = typeof error.status === 'number' ? error.status : body?.statusCode
  return {
    message: body?.message || fallback,
    fieldErrors: body?.errors ?? {},
    status,
  }
}

export function getErrorMessage(error: unknown, fallback?: string): string {
  return parseApiError(error, fallback).message
}
