import { Input, Select } from 'antd'

interface StatusOption {
  value: string
  label: string
}

interface SearchToolbarProps {
  search: string
  onSearch: (value: string) => void
  placeholder: string
  status?: string
  onStatus?: (value: string | undefined) => void
  statusOptions?: StatusOption[]
}

export function SearchToolbar({
  search,
  onSearch,
  placeholder,
  status,
  onStatus,
  statusOptions,
}: SearchToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <Input.Search
        allowClear
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="sm:max-w-sm"
      />
      {statusOptions && onStatus ? (
        <Select
          allowClear
          value={status}
          placeholder="Status"
          aria-label="Filter by status"
          options={statusOptions}
          onChange={(value) => onStatus(value)}
          className="sm:w-48"
        />
      ) : null}
    </div>
  )
}
