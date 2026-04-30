import {
  buildTableData,
  formatCellValue,
  mapObjectToRows,
  normalizeArrayPayload,
} from './modelUtils'

describe('modelUtils', () => {
  describe('normalizeArrayPayload', () => {
    it('returns arrays unchanged', () => {
      const payload = [{ id: 1 }, { id: 2 }]

      expect(normalizeArrayPayload(payload)).toBe(payload)
    })

    it('wraps a single object in an array', () => {
      expect(normalizeArrayPayload({ id: 1 })).toEqual([{ id: 1 }])
    })

    it('returns an empty array for non-object payloads', () => {
      expect(normalizeArrayPayload(null)).toEqual([])
      expect(normalizeArrayPayload('nope')).toEqual([])
    })
  })

  describe('mapObjectToRows', () => {
    it('maps object entries to rows', () => {
      expect(mapObjectToRows({ a: 1, b: 2 })).toEqual([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
      ])
    })

    it('returns an empty array for invalid payloads', () => {
      expect(mapObjectToRows(null)).toEqual([])
      expect(mapObjectToRows([1, 2])).toEqual([])
    })
  })

  describe('buildTableData', () => {
    it('builds columns, rows, and row count from the model', () => {
      const model = {
        transform: (payload) => payload,
      }

      expect(buildTableData(model, [{ id: 1, name: 'Alpha' }])).toEqual({
        columns: ['id', 'name'],
        rows: [{ id: 1, name: 'Alpha' }],
        rowCount: 1,
      })
    })
  })

  describe('formatCellValue', () => {
    it('formats nullish, array, object, and primitive values', () => {
      expect(formatCellValue(null)).toBe('-')
      expect(formatCellValue([])).toBe('-')
      expect(formatCellValue(['a', 'b'])).toBe('a, b')
      expect(formatCellValue({ ok: true })).toBe('{"ok":true}')
      expect(formatCellValue(42)).toBe('42')
    })
  })
})