export function formatCellValue(value) {
  if (value === null || value === undefined) {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}
