import { normalizeArrayPayload } from '../utils/modelUtils'

const DataModel = {
  key: 'data',
  label: 'Data',
  path: '/api/getData',
  transform: normalizeArrayPayload,
}

export { DataModel }