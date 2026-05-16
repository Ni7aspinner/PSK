const API_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

function extractErrorMessage(body, fallback) {
  if (!body || typeof body !== 'object') {
    return fallback
  }

  if (Array.isArray(body.fieldErrors) && body.fieldErrors.length > 0) {
    return body.fieldErrors
      .map((fieldError) => `${fieldError.field}: ${fieldError.message}`)
      .join(', ')
  }

  return body.message ?? body.error ?? fallback
}

const resourcePaths = {
  Supplier: '/api/suppliers',
  Contract: '/api/contracts',
  Service: '/api/services',
}

const withJsonBody = (method, payload) => ({
  method,
  body: JSON.stringify(payload),
})

async function request(path, session, options = {}, fallback) {
  const headers = {
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return null
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const fallbackMessage = fallback?.(response.status) ?? `Request failed: ${response.status}`
    throw new Error(extractErrorMessage(body, fallbackMessage))
  }

  return body
}

const resourceApi = Object.fromEntries(
  Object.entries(resourcePaths).flatMap(([name, path]) => [
    [`get${name}s`, (session) => request(path, session)],
    [`get${name}`, (session, id) => request(`${path}/${id}`, session)],
    [`create${name}`, (session, payload) => request(path, session, withJsonBody('POST', payload))],
    [`update${name}`, (session, id, payload) => request(`${path}/${id}`, session, withJsonBody('PUT', payload))],
    [`delete${name}`, (session, id) => request(`${path}/${id}`, session, { method: 'DELETE' })],
  ]),
)

const backendApi = {
  ...resourceApi,
  login: (payload) => request('/api/auth/login', null, withJsonBody('POST', payload), () => 'Invalid credentials.'),
  register: (payload) => request('/api/auth/register', null, withJsonBody('POST', payload), (status) => `Registration failed: ${status}`),
  getSupplierServices: (session, supplierId) =>
    request(`/api/suppliers/${supplierId}/services`, session),
  terminateContract: (session, id) =>
    request(`/api/contracts/${id}/terminate`, session, { method: 'POST' }),
}

export { API_BASE, backendApi }
