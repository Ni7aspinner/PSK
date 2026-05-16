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
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/suppliers`, {
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
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE}/api/contracts/5`, {
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

    expect(fetchMock).toHaveBeenNthCalledWith(1, `${API_BASE}/api/suppliers/9/services`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(2, `${API_BASE}/api/contracts/12/terminate`, {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
      method: 'POST',
    })
  })
})
