import type {
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
  | ContactCreatePayload
  | ContactUpdatePayload
  | ContractCreatePayload
  | ContractUpdatePayload
  | ServiceCreatePayload
  | ServiceUpdatePayload
type ErrorBody = { message?: string; error?: string; fieldErrors?: Array<{ field: string; message: string }> }

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
    throw new Error(extractErrorMessage(body, fallbackMessage))
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
    throw new Error(extractErrorMessage(body, `Request failed: ${response.status}`))
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
  deleteSupplier: (session: Session, id: number) =>
    request<null>(`/suppliers/${id}`, session, { method: 'DELETE' }),
  getContacts: (session: Session) => request<Contact[]>('/contacts', session),
  getContact: (session: Session, id: number) => request<Contact>(`/contacts/${id}`, session),
  createContact: (session: Session, payload: ContactCreatePayload) =>
    request<Contact>('/contacts', session, withJsonBody('POST', payload)),
  updateContact: (session: Session, id: number, payload: ContactUpdatePayload) =>
    request<Contact>(`/contacts/${id}`, session, withJsonBody('PUT', payload)),
  deleteContact: (session: Session, id: number) => request<null>(`/contacts/${id}`, session, { method: 'DELETE' }),
  getContracts: (session: Session) => request<Contract[]>('/contracts', session),
  getContract: (session: Session, id: number) => request<Contract>(`/contracts/${id}`, session),
  createContract: (session: Session, payload: ContractCreatePayload) =>
    request<Contract>('/contracts', session, withJsonBody('POST', payload)),
  updateContract: (session: Session, id: number, payload: ContractUpdatePayload) =>
    request<Contract>(`/contracts/${id}`, session, withJsonBody('PUT', payload)),
  deleteContract: (session: Session, id: number) =>
    request<null>(`/contracts/${id}`, session, { method: 'DELETE' }),
  getServices: (session: Session) => request<Service[]>('/services', session),
  getService: (session: Session, id: number) => request<Service>(`/services/${id}`, session),
  createService: (session: Session, payload: ServiceCreatePayload) =>
    request<Service>('/services', session, withJsonBody('POST', payload)),
  updateService: (session: Session, id: number, payload: ServiceUpdatePayload) =>
    request<Service>(`/services/${id}`, session, withJsonBody('PUT', payload)),
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
}

export { API_BASE, backendApi }
