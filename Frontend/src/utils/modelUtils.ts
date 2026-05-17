export function formatCellValue(value: unknown) {
  if (value === null || value === undefined) {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return value.toString()
  if (typeof value === 'symbol') return value.description ?? '-'

  return '-'
}
