import type {
  ActiveSuppliersReport,
  AuthPayload,
  Contact,
  ContactCreatePayload,
  ContactUpdatePayload,
  Contract,
  ContractCreatePayload,
  ContractUpdatePayload,
  RegisteredUser,
  Service,
  ServiceCreatePayload,
  ServiceUpdatePayload,
  Session,
  Supplier,
  SupplierCreatePayload,
  SupplierUpdatePayload,
} from '../models/resourceConfig'

const API_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

type JsonPayload =
  | AuthPayload
  | SupplierCreatePayload
  | SupplierUpdatePayload
  | (SupplierUpdatePayload & { forceOverwrite: true })
  | ContactCreatePayload
  | ContactUpdatePayload
  | (ContactUpdatePayload & { forceOverwrite: true })
  | ContractCreatePayload
  | ContractUpdatePayload
  | (ContractUpdatePayload & { forceOverwrite: true })
  | ServiceCreatePayload
  | ServiceUpdatePayload
  | (ServiceUpdatePayload & { forceOverwrite: true })
type ErrorBody = {
  message?: string
  error?: string
  fieldErrors?: Array<{ field: string; message: string }>
}
export type OptimisticLockConflictBody = ErrorBody & {
  currentState?: unknown
  currentVersion?: number
  entityId?: number
  entityType?: string
  submittedState?: unknown
  submittedVersion?: number
}

export class BackendApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    message: string,
  ) {
    super(message)
    this.name = 'BackendApiError'
  }
}

const isErrorBody = (body: unknown): body is ErrorBody => Boolean(body) && typeof body === 'object'

function extractErrorMessage(body: unknown, fallback: string) {
  if (!isErrorBody(body)) {
    return fallback
  }

  if (Array.isArray(body.fieldErrors) && body.fieldErrors.length > 0) {
    return body.fieldErrors.map((fieldError) => `${fieldError.field}: ${fieldError.message}`).join(', ')
  }

  return body.message ?? body.error ?? fallback
}

const withJsonBody = (method: string, payload: JsonPayload): RequestInit => ({ method, body: JSON.stringify(payload) })

export function isOptimisticLockConflictError(
  error: unknown,
): error is BackendApiError & { body: OptimisticLockConflictBody } {
  return (
    error instanceof BackendApiError &&
    error.status === 409 &&
    isErrorBody(error.body) &&
    ('currentState' in error.body || 'submittedState' in error.body)
  )
}

async function request<T>(
  path: string,
  session: Session | null,
  options: RequestInit = {},
  fallback?: (status: number) => string,
): Promise<T> {
  const headers: HeadersInit = {
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) return null as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const fallbackMessage = fallback?.(response.status) ?? `Request failed: ${response.status}`
    throw new BackendApiError(response.status, body, extractErrorMessage(body, fallbackMessage))
  }

  return body
}

async function requestBlob(path: string, session: Session) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new BackendApiError(response.status, body, extractErrorMessage(body, `Request failed: ${response.status}`))
  }

  return response.blob()
}

const backendApi = {
  getSuppliers: (session: Session) => request<Supplier[]>('/suppliers', session),
  getSupplier: (session: Session, id: number) => request<Supplier>(`/suppliers/${id}`, session),
  createSupplier: (session: Session, payload: SupplierCreatePayload) =>
    request<Supplier>('/suppliers', session, withJsonBody('POST', payload)),
  updateSupplier: (session: Session, id: number, payload: SupplierUpdatePayload) =>
    request<Supplier>(`/suppliers/${id}`, session, withJsonBody('PUT', payload)),
  forceOverwriteSupplier: (session: Session, id: number, payload: SupplierUpdatePayload) =>
    request<Supplier>(`/suppliers/${id}/force`, session, withJsonBody('PUT', { ...payload, forceOverwrite: true })),
  deleteSupplier: (session: Session, id: number) =>
    request<null>(`/suppliers/${id}`, session, { method: 'DELETE' }),
  getContacts: (session: Session) => request<Contact[]>('/contacts', session),
  getContact: (session: Session, id: number) => request<Contact>(`/contacts/${id}`, session),
  createContact: (session: Session, payload: ContactCreatePayload) =>
    request<Contact>('/contacts', session, withJsonBody('POST', payload)),
  updateContact: (session: Session, id: number, payload: ContactUpdatePayload) =>
    request<Contact>(`/contacts/${id}`, session, withJsonBody('PUT', payload)),
  forceOverwriteContact: (session: Session, id: number, payload: ContactUpdatePayload) =>
    request<Contact>(`/contacts/${id}/force`, session, withJsonBody('PUT', { ...payload, forceOverwrite: true })),
  deleteContact: (session: Session, id: number) => request<null>(`/contacts/${id}`, session, { method: 'DELETE' }),
  getContracts: (session: Session) => request<Contract[]>('/contracts', session),
  getContract: (session: Session, id: number) => request<Contract>(`/contracts/${id}`, session),
  createContract: (session: Session, payload: ContractCreatePayload) =>
    request<Contract>('/contracts', session, withJsonBody('POST', payload)),
  updateContract: (session: Session, id: number, payload: ContractUpdatePayload) =>
    request<Contract>(`/contracts/${id}`, session, withJsonBody('PUT', payload)),
  forceOverwriteContract: (session: Session, id: number, payload: ContractUpdatePayload) =>
    request<Contract>(`/contracts/${id}/force`, session, withJsonBody('PUT', { ...payload, forceOverwrite: true })),
  deleteContract: (session: Session, id: number) =>
    request<null>(`/contracts/${id}`, session, { method: 'DELETE' }),
  getServices: (session: Session) => request<Service[]>('/services', session),
  getService: (session: Session, id: number) => request<Service>(`/services/${id}`, session),
  createService: (session: Session, payload: ServiceCreatePayload) =>
    request<Service>('/services', session, withJsonBody('POST', payload)),
  updateService: (session: Session, id: number, payload: ServiceUpdatePayload) =>
    request<Service>(`/services/${id}`, session, withJsonBody('PUT', payload)),
  forceOverwriteService: (session: Session, id: number, payload: ServiceUpdatePayload) =>
    request<Service>(`/services/${id}/force`, session, withJsonBody('PUT', { ...payload, forceOverwrite: true })),
  deleteService: (session: Session, id: number) => request<null>(`/services/${id}`, session, { method: 'DELETE' }),
  login: (payload: AuthPayload) =>
    request<Session>('/auth/login', null, withJsonBody('POST', payload), () => 'Invalid credentials.'),
  register: (payload: AuthPayload) =>
    request<RegisteredUser>(
      '/auth/register',
      null,
      withJsonBody('POST', payload),
      (status) => `Registration failed: ${status}`,
    ),
  getSupplierServices: (session: Session, supplierId: number) =>
    request<Service[]>(`/suppliers/${supplierId}/services`, session),
  getSupplierContacts: (session: Session, supplierId: number) =>
    request<Contact[]>(`/suppliers/${supplierId}/contacts`, session),
  getActiveSuppliersPdf: (session: Session) => requestBlob('/reports/active-suppliers/pdf', session),
  terminateContract: (session: Session, id: number) =>
    request<Contract>(`/contracts/${id}/terminate`, session, { method: 'POST' }),
  setPrimaryContact: (session: Session, id: number) =>
    request<Contact>(`/contacts/${id}/set-primary`, session, { method: 'PUT' }),
  getActiveSuppliersReport: (session: Session) =>
    request<ActiveSuppliersReport>('/reports/active-suppliers', session),
}

export { API_BASE, backendApi }
