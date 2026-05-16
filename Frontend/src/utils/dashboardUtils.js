import { resourceConfig } from '../models/resourceConfig'

export const asRows = (value) => (Array.isArray(value) ? value : [])

const isEditCreateOnlyField = (field, mode) => mode === 'edit' && field.createOnly

function normalizeActiveValue(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}

function normalizeFieldValue(field, value) {
  if (field.type === 'number') {
    return value === '' || value === null ? null : Number(value)
  }

  if (field.type === 'select' && field.name === 'active') {
    return normalizeActiveValue(value)
  }

  return value
}

const hasValue = (value) => value !== '' && value !== null

export function formPayload(form, fields, mode, source) {
  const formData = new FormData(form)
  const payload = {}

  for (const field of fields) {
    if (isEditCreateOnlyField(field, mode)) continue

    const value = normalizeFieldValue(field, formData.get(field.name))
    if (hasValue(value)) payload[field.name] = value
  }

  if (mode === 'edit' && source?.version !== undefined) {
    payload.version = source.version
  }
  
  return payload
}

export const replaceById = (rows, item) => rows.map((row) => (row.id === item.id ? item : row))

export const resourceLabel = (resourceKey, item) => {
  if (!item) return '-'
  if (resourceKey === 'contracts') return item.title ?? item.contractNumber
  return item?.[resourceConfig[resourceKey].primaryField] ?? item?.title
}

export const contractsForSupplier = (contracts, supplierId) => contracts.filter((c) => c.supplierId === supplierId)

export const servicesForContract = (services, contract) => {
  const serviceIds = Array.isArray(contract.serviceIds) ? contract.serviceIds : []
  return services.filter((s) => s.contractId === contract.id || serviceIds.includes(s.id))
}

export function getEnrichedRows(resourceKey, resources) {
  const rows = resources[resourceKey]

  if (resourceKey === 'contracts') {
    const supMap = new Map(resources.suppliers.map((s) => [s.id, s.name]))
    return rows.map((c) => ({
      ...c,
      supplierName: supMap.get(c.supplierId) ?? 'Unknown Supplier',
      servicesCount: servicesForContract(resources.services, c).length,
    }))
  }

  if (resourceKey === 'services') {
    const supMap = new Map(resources.suppliers.map((s) => [s.id, s.name]))
    const conMap = new Map(resources.contracts.map((c) => [c.id, c.title ?? c.contractNumber]))
    return rows.map((s) => ({
      ...s,
      supplierName: supMap.get(s.supplierId) ?? 'Unknown Supplier',
      contractTitle: conMap.get(s.contractId) ?? 'Unassigned',
      activeLabel: s.active ? 'Active' : 'Inactive',
    }))
  }

  return rows
}
