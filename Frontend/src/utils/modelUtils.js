function normalizeArrayPayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    return [payload]
  }

  return []
}

function mapObjectToRows(payload, keyName = 'key', valueName = 'value') {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return []
  }

  return Object.entries(payload).map(([key, value]) => ({
    [keyName]: key,
    [valueName]: value,
  }))
}

function collectColumns(rows) {
  const columns = []
  const seen = new Set()

  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      continue
    }

    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }

  return columns
}

function buildTableData(model, payload) {
  const rows = model.transform(payload)
  const columns = collectColumns(rows)

  return {
    columns,
    rows,
    rowCount: rows.length,
  }
}

function formatCellValue(value) {
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

export {
  normalizeArrayPayload,
  mapObjectToRows,
  buildTableData,
  formatCellValue,
}
