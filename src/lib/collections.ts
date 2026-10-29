export function cleanParams(params: object): Record<string, string | number> {
  const result: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value !== '') result[key] = value
    if (typeof value === 'number' && !Number.isNaN(value)) result[key] = value
  }
  return result
}
