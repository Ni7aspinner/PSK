export type AuthMode = 'login' | 'register'
export type ResourceKey = 'suppliers' | 'contacts' | 'contracts' | 'services'
export type ResourceMode = 'create' | 'edit'

export type Session = { role?: string; token: string; username?: string }
export type RegisteredUser = {
  createdAt?: string
  enabled?: boolean
  id?: number
  role?: string
  username: string
  version?: number
}
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED'

export type Supplier = {
  id: number
  createdAt?: string | null
  email?: string | null
  name: string
  phone?: string | null
  registrationCode: string
  version?: number
}

export type Contact = {
  id: number
  createdAt?: string | null
  email?: string | null
  firstName: string
  lastName: string
  phone?: string | null
  position?: string | null
  primary: boolean
  supplierId: number
  version?: number
}

export type Contract = {
  id: number
  contractNumber: string
  endDate: string
  serviceIds?: number[]
  startDate: string
  status: ContractStatus
  supplierId: number
  title: string
  version?: number
}

export type Service = {
  id: number
  active: boolean
  contractId?: number | null
  createdAt?: string | null
  description?: string | null
  name: string
  supplierId: number
  version?: number
}

export type EnrichedContract = Contract & { servicesCount: number; supplierName: string }
export type EnrichedContact = Contact & { primaryLabel: 'Primary' | 'Secondary'; supplierName: string }
export type EnrichedService = Service & {
  activeLabel: 'Active' | 'Inactive'
  contractTitle: string
  supplierName: string
}
export type ResourceItem = Supplier | Contact | Contract | Service | EnrichedContact | EnrichedContract | EnrichedService
export type WorkspaceResourceKey = Exclude<ResourceKey, 'suppliers'>
export type ResourceCreateDefaults = Partial<Record<'contractId' | 'supplierId', string | number | boolean | null | { id: number }>>

export type Resources = {
  suppliers: Supplier[]
  contacts: Contact[]
  contracts: Contract[]
  services: Service[]
}

export type ResourceDetail = {
  item?: ResourceItem
  contract?: Contract | null
  contracts?: Contract[]
  contacts?: Contact[]
  services?: Service[]
  supplier?: Supplier | null
}

export type AuthPayload = { username: string; password: string }
export type SupplierCreatePayload = { email?: string; name: string; phone?: string; registrationCode: string }
export type SupplierUpdatePayload = Omit<SupplierCreatePayload, 'registrationCode'> & { version: number }
export type ContactCreatePayload = {
  email?: string
  firstName: string
  lastName: string
  phone?: string
  position?: string
  primary?: boolean
  supplierId: number
}
export type ContactUpdatePayload = ContactCreatePayload & { primary: boolean; version: number }
export type ContractCreatePayload = {
  contractNumber: string
  endDate: string
  startDate: string
  status?: ContractStatus
  supplierId: number
  title: string
}
export type ContractUpdatePayload = Omit<ContractCreatePayload, 'contractNumber' | 'status' | 'supplierId'> & {
  status: ContractStatus
  version: number
}
export type ServiceCreatePayload = {
  active?: boolean
  contractId?: number | null
  description?: string
  name: string
  supplierId: number
}
export type ServiceUpdatePayload = Omit<ServiceCreatePayload, 'active'> & { active: boolean; version: number }

export type ResourcePayload =
  | SupplierCreatePayload
  | SupplierUpdatePayload
  | ContactCreatePayload
  | ContactUpdatePayload
  | ContractCreatePayload
  | ContractUpdatePayload
  | ServiceCreatePayload
  | ServiceUpdatePayload

type ResourceFieldName =
  | keyof SupplierCreatePayload
  | keyof SupplierUpdatePayload
  | keyof ContactCreatePayload
  | keyof ContactUpdatePayload
  | keyof ContractCreatePayload
  | keyof ContractUpdatePayload
  | keyof ServiceCreatePayload
  | keyof ServiceUpdatePayload

export type FieldConfig = {
  name: ResourceFieldName
  label?: string
  type?: 'date' | 'email' | 'number' | 'resourceSelect' | 'select' | 'text'
  options?: ContractStatus[] | Array<'true' | 'false'>
  resourceTarget?: ResourceKey
  createOnly?: boolean
  required?: boolean
}

export type ResourceConfig = {
  title: string
  singular: string
  primaryField: string
  apiName: 'Supplier' | 'Contact' | 'Contract' | 'Service'
  fields: FieldConfig[]
  columns: Array<{ key: string; label: string }>
}

export const resourceConfig = {
  suppliers: {
    title: 'Suppliers',
    singular: 'supplier',
    apiName: 'Supplier',
    primaryField: 'name',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'registrationCode', label: 'Registration code', createOnly: true, required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'registrationCode', label: 'Registration Code' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
    ],
  },
  contacts: {
    title: 'Contacts',
    singular: 'contact',
    apiName: 'Contact',
    primaryField: 'lastName',
    fields: [
      { name: 'firstName', label: 'First name', required: true },
      { name: 'lastName', label: 'Last name', required: true },
      { name: 'position', label: 'Position' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
      { name: 'primary', label: 'Primary', type: 'select', options: ['true', 'false'], required: true },
      { name: 'supplierId', label: 'Supplier', type: 'resourceSelect', resourceTarget: 'suppliers', required: true },
    ],
    columns: [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'position', label: 'Position' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'primaryLabel', label: 'Primary' },
    ],
  },
  contracts: {
    title: 'Contracts',
    singular: 'contract',
    apiName: 'Contract',
    primaryField: 'contractNumber',
    fields: [
      { name: 'contractNumber', label: 'Contract number', createOnly: true, required: true },
      { name: 'title', label: 'Title', required: true },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'EXPIRED', 'TERMINATED'], required: true },
      {
        name: 'supplierId',
        label: 'Supplier',
        type: 'resourceSelect',
        resourceTarget: 'suppliers',
        createOnly: true,
        required: true,
      },
    ],
    columns: [
      { key: 'contractNumber', label: 'Contract Number' },
      { key: 'title', label: 'Title' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'status', label: 'Status' },
      { key: 'servicesCount', label: 'Linked Services' },
    ],
  },
  services: {
    title: 'Services',
    singular: 'service',
    apiName: 'Service',
    primaryField: 'name',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description' },
      { name: 'active', label: 'Active', type: 'select', options: ['true', 'false'], required: true },
      { name: 'supplierId', label: 'Supplier', type: 'resourceSelect', resourceTarget: 'suppliers', required: true },
      { name: 'contractId', label: 'Contract', type: 'resourceSelect', resourceTarget: 'contracts' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'supplierName', label: 'Supplier' },
      { key: 'contractTitle', label: 'Contract' },
      { key: 'activeLabel', label: 'Status' },
    ],
  },
} satisfies Record<ResourceKey, ResourceConfig>

export const navItems = [
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'contracts', label: 'Contracts' },
  { key: 'services', label: 'Services' },
] satisfies Array<{ key: ResourceKey; label: string }>
