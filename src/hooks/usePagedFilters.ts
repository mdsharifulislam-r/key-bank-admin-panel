import { useEffect, useState } from 'react'
import type { PageQuery } from '@/types/api'

export function usePagedFilters() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<string | undefined>()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim())
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const onSearchChange = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }

  const onStatus = (value: string | undefined) => {
    setStatus(value)
    setPage(1)
  }

  const onPageChange = (nextPage: number, nextLimit: number) => {
    setPage(nextLimit === limit ? nextPage : 1)
    setLimit(nextLimit)
  }

  const params: PageQuery = {
    page,
    limit,
    searchTerm: searchTerm || undefined,
    status,
  }

  return { params, page, limit, searchInput, onSearchChange, status, onStatus, onPageChange }
}
