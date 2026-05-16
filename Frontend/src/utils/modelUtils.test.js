import { formatCellValue } from './modelUtils'

describe('modelUtils', () => {
  describe('formatCellValue', () => {
    it('formats nullish, array, object, and primitive values', () => {
      expect(formatCellValue(null)).toBe('-')
      expect(formatCellValue(undefined)).toBe('-')
      expect(formatCellValue([])).toBe('-')
      expect(formatCellValue(['a', 'b'])).toBe('a, b')
      expect(formatCellValue({ ok: true })).toBe('{"ok":true}')
      expect(formatCellValue(42)).toBe('42')
    })
  })
})
