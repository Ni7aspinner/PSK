import {
  resourceConfig,
  type Contract,
  type ContractStatus,
  type EnrichedContract,
  type EnrichedService,
  type FieldConfig,
  type ResourceItem,
  type ResourceKey,
  type ResourceMode,
  type ResourcePayload,
  type Resources,
  type Service,
  type Supplier,
} from '../models/resourceConfig'

type FormValue = string | number | boolean | null

export const asRows = <T extends ResourceItem>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

const isEditCreateOnlyField = (field: FieldConfig, mode: ResourceMode) => mode === 'edit' && field.createOnly

function normalizeActiveValue(value: FormDataEntryValue | null): boolean | null {
  if (value === 'true') return true
  if (value === 'false') return false
  return null
}

function normalizeFieldValue(field: FieldConfig, value: FormDataEntryValue | null): FormValue {
  if (field.type === 'number' || field.type === 'resourceSelect') {
    return value === '' || value === null ? null : Number(value)
  }

  if (field.type === 'select' && field.name === 'active') {
    return normalizeActiveValue(value)
  }

  return typeof value === 'string' ? value : null
}

const hasValue = (value: FormValue) => value !== '' && value !== null

export function formPayload(
  form: HTMLFormElement,
  fields: FieldConfig[],
  mode: ResourceMode,
  source?: ResourceItem,
): ResourcePayload {
  const formData = new FormData(form)
  const payload: Partial<Record<FieldConfig['name'] | 'version', FormValue>> = {}

  for (const field of fields) {
    if (isEditCreateOnlyField(field, mode)) continue

    const value = normalizeFieldValue(field, formData.get(field.name))
    if (hasValue(value)) payload[field.name] = value
  }

  if (mode === 'edit' && source?.version !== undefined) {
    payload.version = source.version
  }

  return payload as ResourcePayload
}

export const replaceById = <T extends ResourceItem>(rows: T[], item: T) =>
  rows.map((row) => (row.id === item.id ? item : row))

export const removeById = <T extends ResourceItem>(rows: T[], id: number) => rows.filter((row) => row.id !== id)

export const resourceValue = (item: ResourceItem, field: string): string | number | boolean | null | undefined => {
  if (field in item) {
    return (item as unknown as Record<string, string | number | boolean | null | undefined>)[field]
  }
  return undefined
}

export const isContractLike = (item: ResourceItem): item is Contract | EnrichedContract => 'contractNumber' in item

export const resourceLabel = (resourceKey: ResourceKey, item?: ResourceItem | null) => {
  if (!item) return '-'
  if (resourceKey === 'contracts' && isContractLike(item)) return String(item.title ?? item.contractNumber ?? item.id)
  const primaryField = resourceConfig[resourceKey].primaryField
  return String(resourceValue(item, primaryField) ?? item.id)
}

export const contractsForSupplier = (contracts: Contract[], supplierId: number) =>
  contracts.filter((c) => c.supplierId === supplierId)

export const servicesForContract = (services: Service[], contract: Contract) => {
  const serviceIds = Array.isArray(contract.serviceIds) ? contract.serviceIds : []
  return services.filter((s) => s.contractId === contract.id || serviceIds.includes(s.id))
}

export function getEnrichedRows(resourceKey: 'suppliers', resources: Resources): Supplier[]
export function getEnrichedRows(resourceKey: 'contracts', resources: Resources): EnrichedContract[]
export function getEnrichedRows(resourceKey: 'services', resources: Resources): EnrichedService[]
export function getEnrichedRows(
  resourceKey: ResourceKey,
  resources: Resources,
): Supplier[] | EnrichedContract[] | EnrichedService[]
export function getEnrichedRows(
  resourceKey: ResourceKey,
  resources: Resources,
): Supplier[] | EnrichedContract[] | EnrichedService[] {
  if (resourceKey === 'contracts') {
    const supMap = new Map(resources.suppliers.map((s) => [s.id, s.name]))
    return resources.contracts.map((c) => ({
      ...c,
      supplierName: supMap.get(c.supplierId) ?? 'Unknown Supplier',
      servicesCount: servicesForContract(resources.services, c).length,
    }))
  }

  if (resourceKey === 'services') {
    const supMap = new Map(resources.suppliers.map((s) => [s.id, s.name]))
    const conMap = new Map(resources.contracts.map((c) => [c.id, c.title ?? c.contractNumber]))
    return resources.services.map(
      (s): EnrichedService => ({
        ...s,
        supplierName: supMap.get(s.supplierId) ?? 'Unknown Supplier',
        contractTitle:
          s.contractId === undefined || s.contractId === null
            ? 'Unassigned'
            : (conMap.get(s.contractId) ?? 'Unassigned'),
        activeLabel: s.active ? 'Active' : 'Inactive',
      }),
    )
  }

  return resources.suppliers
}

export const isContractStatus = (value: FormValue): value is ContractStatus =>
  value === 'ACTIVE' || value === 'EXPIRED' || value === 'TERMINATED'
