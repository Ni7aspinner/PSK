import type {
  AuthPayload,
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

const backendApi = {
  getSuppliers: (session: Session) => request<Supplier[]>('/api/suppliers', session),
  getSupplier: (session: Session, id: number) => request<Supplier>(`/api/suppliers/${id}`, session),
  createSupplier: (session: Session, payload: SupplierCreatePayload) =>
    request<Supplier>('/api/suppliers', session, withJsonBody('POST', payload)),
  updateSupplier: (session: Session, id: number, payload: SupplierUpdatePayload) =>
    request<Supplier>(`/api/suppliers/${id}`, session, withJsonBody('PUT', payload)),
  deleteSupplier: (session: Session, id: number) =>
    request<null>(`/api/suppliers/${id}`, session, { method: 'DELETE' }),
  getContracts: (session: Session) => request<Contract[]>('/api/contracts', session),
  getContract: (session: Session, id: number) => request<Contract>(`/api/contracts/${id}`, session),
  createContract: (session: Session, payload: ContractCreatePayload) =>
    request<Contract>('/api/contracts', session, withJsonBody('POST', payload)),
  updateContract: (session: Session, id: number, payload: ContractUpdatePayload) =>
    request<Contract>(`/api/contracts/${id}`, session, withJsonBody('PUT', payload)),
  deleteContract: (session: Session, id: number) =>
    request<null>(`/api/contracts/${id}`, session, { method: 'DELETE' }),
  getServices: (session: Session) => request<Service[]>('/api/services', session),
  getService: (session: Session, id: number) => request<Service>(`/api/services/${id}`, session),
  createService: (session: Session, payload: ServiceCreatePayload) =>
    request<Service>('/api/services', session, withJsonBody('POST', payload)),
  updateService: (session: Session, id: number, payload: ServiceUpdatePayload) =>
    request<Service>(`/api/services/${id}`, session, withJsonBody('PUT', payload)),
  deleteService: (session: Session, id: number) => request<null>(`/api/services/${id}`, session, { method: 'DELETE' }),
  login: (payload: AuthPayload) =>
    request<Session>('/api/auth/login', null, withJsonBody('POST', payload), () => 'Invalid credentials.'),
  register: (payload: AuthPayload) =>
    request<RegisteredUser>(
      '/api/auth/register',
      null,
      withJsonBody('POST', payload),
      (status) => `Registration failed: ${status}`,
    ),
  getSupplierServices: (session: Session, supplierId: number) =>
    request<Service[]>(`/api/suppliers/${supplierId}/services`, session),
  terminateContract: (session: Session, id: number) =>
    request<Contract>(`/api/contracts/${id}/terminate`, session, { method: 'POST' }),
}

export { API_BASE, backendApi }
