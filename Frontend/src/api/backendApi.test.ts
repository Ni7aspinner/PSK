import { API_BASE, backendApi } from './backendApi'

describe('backendApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends authenticated JSON requests for resource mutations', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 3, name: 'Acme', registrationCode: 'ACME-1' }),
    } as Response)

    const result = await backendApi.createSupplier({ token: 'jwt-token' }, { name: 'Acme', registrationCode: 'ACME-1' })

    expect(result).toEqual({ id: 3, name: 'Acme', registrationCode: 'ACME-1' })
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/suppliers`, {
      body: JSON.stringify({ name: 'Acme', registrationCode: 'ACME-1' }),
      headers: {
        Authorization: 'Bearer jwt-token',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })

  it('returns null for successful no-content deletes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn(),
    } as unknown as Response)

    await expect(backendApi.deleteContract({ token: 'jwt-token' }, 5)).resolves.toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/contracts/5`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
      method: 'DELETE',
    })
  })

  it('uses backend field errors as the thrown error message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        fieldErrors: [
          { field: 'username', message: 'must not be blank' },
          { field: 'password', message: 'too short' },
        ],
      }),
    } as Response)

    await expect(backendApi.register({ username: '', password: 'x' })).rejects.toThrow(
      'username: must not be blank, password: too short',
    )
  })

  it('uses endpoint fallback messages when an error body has no message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response)

    await expect(backendApi.login({ username: 'ada', password: 'wrong' })).rejects.toThrow('Invalid credentials.')
  })

  it('calls relationship and contract action endpoints', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 1, active: true, name: 'Helpdesk', supplierId: 9 }],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          id: 12,
          contractNumber: 'C-012',
          endDate: '2026-12-31',
          startDate: '2026-01-01',
          status: 'TERMINATED',
          supplierId: 9,
          title: 'Terminated',
        }),
      } as Response)

    await expect(backendApi.getSupplierServices({ token: 'jwt-token' }, 9)).resolves.toEqual([
      { id: 1, active: true, name: 'Helpdesk', supplierId: 9 },
    ])
    await expect(backendApi.terminateContract({ token: 'jwt-token' }, 12)).resolves.toMatchObject({
      status: 'TERMINATED',
    })

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_BASE}/suppliers/9/services`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_BASE}/contracts/12/terminate`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
      method: 'POST',
    })
  })

  it('calls contact relationship and primary action endpoints', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 4, firstName: 'Ada', lastName: 'Lovelace', primary: false, supplierId: 9 }],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 4, firstName: 'Ada', lastName: 'Lovelace', primary: true, supplierId: 9 }),
      } as Response)

    await expect(backendApi.getSupplierContacts({ token: 'jwt-token' }, 9)).resolves.toEqual([
      { id: 4, firstName: 'Ada', lastName: 'Lovelace', primary: false, supplierId: 9 },
    ])
    await expect(backendApi.setPrimaryContact({ token: 'jwt-token' }, 4)).resolves.toMatchObject({
      primary: true,
    })

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_BASE}/suppliers/9/contacts`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_BASE}/contacts/4/set-primary`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
      method: 'PUT',
    })
  })

  it('fetches the active suppliers pdf as a blob', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => blob,
    } as Response)

    await expect(backendApi.getActiveSuppliersPdf({ token: 'jwt-token' })).resolves.toBe(blob)

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}reports/active-suppliers/pdf`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
    })
  })

  it('maps resource read, update, and delete helpers to their backend endpoints', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 7 }),
    } as Response)
    const session = { token: 'jwt-token' }

    await backendApi.getSuppliers(session)
    await backendApi.getSupplier(session, 7)
    await backendApi.updateSupplier(session, 7, { name: 'Acme', version: 1 })
    await backendApi.deleteSupplier(session, 7)
    await backendApi.getContacts(session)
    await backendApi.getContact(session, 7)
    await backendApi.createContact(session, {
      email: 'ada@example.test',
      firstName: 'Ada',
      lastName: 'Lovelace',
      phone: '555-0100',
      primary: false,
      supplierId: 2,
    })
    await backendApi.updateContact(session, 7, {
      email: 'ada@example.test',
      firstName: 'Ada',
      lastName: 'Byron',
      phone: '555-0101',
      primary: true,
      supplierId: 2,
      version: 1,
    })
    await backendApi.deleteContact(session, 7)
    await backendApi.getContracts(session)
    await backendApi.getContract(session, 7)
    await backendApi.createContract(session, {
      contractNumber: 'C-007',
      endDate: '2026-12-31',
      startDate: '2026-01-01',
      status: 'ACTIVE',
      supplierId: 2,
      title: 'Support',
    })
    await backendApi.updateContract(session, 7, {
      endDate: '2026-12-31',
      startDate: '2026-01-01',
      status: 'EXPIRED',
      title: 'Support',
      version: 1,
    })
    await backendApi.getServices(session)
    await backendApi.getService(session, 7)
    await backendApi.createService(session, { active: true, name: 'Helpdesk', supplierId: 2 })
    await backendApi.updateService(session, 7, { active: false, name: 'Helpdesk', supplierId: 2, version: 1 })
    await backendApi.deleteService(session, 7)

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_BASE}/suppliers`, {
      headers: { Authorization: 'Bearer jwt-token' },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_BASE}/suppliers/7`, {
      headers: { Authorization: 'Bearer jwt-token' },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(3, `${API_BASE}/suppliers/7`, {
      body: JSON.stringify({ name: 'Acme', version: 1 }),
      headers: { Authorization: 'Bearer jwt-token', 'Content-Type': 'application/json' },
      method: 'PUT',
    })
    expect(fetchMock).toHaveBeenNthCalledWith(4, `${API_BASE}/suppliers/7`, {
      headers: { Authorization: 'Bearer jwt-token' },
      method: 'DELETE',
    })
    expect(fetchMock).toHaveBeenNthCalledWith(5, `${API_BASE}/contacts`, {
      headers: { Authorization: 'Bearer jwt-token' },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(6, `${API_BASE}/contacts/7`, {
      headers: { Authorization: 'Bearer jwt-token' },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(7, `${API_BASE}/contacts`, expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenNthCalledWith(8, `${API_BASE}/contacts/7`, expect.objectContaining({ method: 'PUT' }))
    expect(fetchMock).toHaveBeenNthCalledWith(9, `${API_BASE}/contacts/7`, expect.objectContaining({ method: 'DELETE' }))
    expect(fetchMock).toHaveBeenNthCalledWith(10, `${API_BASE}/contracts`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(11, `${API_BASE}/contracts/7`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(12, `${API_BASE}/contracts`, expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenNthCalledWith(13, `${API_BASE}/contracts/7`, expect.objectContaining({ method: 'PUT' }))
    expect(fetchMock).toHaveBeenNthCalledWith(14, `${API_BASE}/services`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(15, `${API_BASE}/services/7`, expect.any(Object))
    expect(fetchMock).toHaveBeenNthCalledWith(16, `${API_BASE}/services`, expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenNthCalledWith(17, `${API_BASE}/services/7`, expect.objectContaining({ method: 'PUT' }))
    expect(fetchMock).toHaveBeenNthCalledWith(18, `${API_BASE}/services/7`, expect.objectContaining({ method: 'DELETE' }))
  })

  it('uses backend message, backend error, and request fallback for failed responses', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Supplier already exists.' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Backend unavailable.' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => {
          throw new Error('not json')
        },
      } as unknown as Response)

    await expect(
      backendApi.createSupplier({ token: 'jwt-token' }, { name: 'Acme', registrationCode: 'ACME-1' }),
    ).rejects.toThrow('Supplier already exists.')
    await expect(backendApi.getServices({ token: 'jwt-token' })).rejects.toThrow('Backend unavailable.')
    await expect(backendApi.getContracts({ token: 'jwt-token' })).rejects.toThrow('Request failed: 503')
  })
})
