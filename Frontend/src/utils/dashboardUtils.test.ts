import {
  asRows,
  contractsForSupplier,
  formPayload,
  getEnrichedRows,
  removeById,
  replaceById,
  resourceLabel,
  servicesForContract,
} from './dashboardUtils'

function formWith(values: Record<string, string>) {
  const form = document.createElement('form')

  for (const [name, value] of Object.entries(values)) {
    const input = document.createElement('input')
    input.name = name
    input.value = value
    form.append(input)
  }

  return form
}

describe('dashboardUtils', () => {
  it('normalizes row payloads to arrays', () => {
    const rows = [{ id: 1 }]

    expect(asRows(rows)).toBe(rows)
    expect(asRows({ id: 1 })).toEqual([])
    expect(asRows(null)).toEqual([])
  })

  it('builds create payloads with typed values and skips empty fields', () => {
    const form = formWith({
      name: 'Cloud support',
      active: 'true',
      supplierId: '7',
      contractId: '',
    })

    expect(
      formPayload(
        form,
        [
          { name: 'name' },
          { name: 'active', type: 'select' },
          { name: 'supplierId', type: 'number' },
          { name: 'contractId', type: 'number' },
        ],
        'create',
      ),
    ).toEqual({
      active: true,
      name: 'Cloud support',
      supplierId: 7,
    })
  })

  it('omits create-only fields and includes version when editing', () => {
    const form = formWith({
      name: 'Updated Supplier',
      registrationCode: 'CREATE-ONLY',
    })

    expect(
      formPayload(form, [{ name: 'name' }, { name: 'registrationCode', createOnly: true }], 'edit', {
        id: 1,
        name: 'Old Supplier',
        registrationCode: 'OLD',
        version: 3,
      }),
    ).toEqual({
      name: 'Updated Supplier',
      version: 3,
    })
  })

  it('replaces matching rows by id without changing other rows', () => {
    expect(
      replaceById(
        [
          { id: 1, name: 'Old', registrationCode: 'OLD' },
          { id: 2, name: 'Same', registrationCode: 'SAME' },
        ],
        { id: 1, name: 'New', registrationCode: 'NEW' },
      ),
    ).toEqual([
      { id: 1, name: 'New', registrationCode: 'NEW' },
      { id: 2, name: 'Same', registrationCode: 'SAME' },
    ])
  })

  it('removes matching rows by id without changing other rows', () => {
    expect(
      removeById(
        [
          { id: 1, name: 'Remove', registrationCode: 'REMOVE' },
          { id: 2, name: 'Keep', registrationCode: 'KEEP' },
        ],
        1,
      ),
    ).toEqual([{ id: 2, name: 'Keep', registrationCode: 'KEEP' }])
  })

  it('formats resource labels from resource-specific primary fields', () => {
    expect(resourceLabel('suppliers', { id: 1, name: 'Acme', registrationCode: 'ACME-1' })).toBe('Acme')
    expect(
      resourceLabel('contracts', {
        id: 10,
        contractNumber: 'C-001',
        endDate: '2026-12-31',
        startDate: '2026-01-01',
        status: 'ACTIVE',
        supplierId: 1,
        title: 'Support Agreement',
      }),
    ).toBe('Support Agreement')
    expect(
      resourceLabel('contracts', {
        id: 11,
        contractNumber: 'C-002',
        endDate: '2026-12-31',
        startDate: '2026-01-01',
        status: 'ACTIVE',
        supplierId: 1,
        title: 'Support Agreement',
      }),
    ).toBe('Support Agreement')
    expect(resourceLabel('services', null)).toBe('-')
  })

  it('finds related contracts and services', () => {
    const contracts = [
      {
        id: 10,
        contractNumber: 'C-010',
        endDate: '2026-12-31',
        startDate: '2026-01-01',
        status: 'ACTIVE' as const,
        supplierId: 1,
        title: 'Contract 10',
      },
      {
        id: 11,
        contractNumber: 'C-011',
        endDate: '2026-12-31',
        startDate: '2026-01-01',
        status: 'ACTIVE' as const,
        supplierId: 2,
        title: 'Contract 11',
      },
    ]
    const services = [
      { id: 20, active: true, contractId: 10, name: 'Service 20', supplierId: 1 },
      { id: 21, active: true, contractId: 99, name: 'Service 21', supplierId: 1 },
      { id: 22, active: true, name: 'Service 22', supplierId: 1 },
    ]

    expect(contractsForSupplier(contracts, 1)).toEqual([contracts[0]])
    expect(
      servicesForContract(services, {
        id: 10,
        contractNumber: 'C-010',
        endDate: '2026-12-31',
        serviceIds: [21],
        startDate: '2026-01-01',
        status: 'ACTIVE',
        supplierId: 1,
        title: 'Contract 10',
      }),
    ).toEqual([services[0], services[1]])
  })

  it('enriches contract and service rows for display', () => {
    const resources = {
      suppliers: [{ id: 1, name: 'Acme', registrationCode: 'ACME-1' }],
      contracts: [
        {
          id: 10,
          contractNumber: 'C-001',
          endDate: '2026-12-31',
          serviceIds: [20],
          startDate: '2026-01-01',
          status: 'ACTIVE' as const,
          supplierId: 1,
          title: 'Support Agreement',
        },
        {
          id: 11,
          contractNumber: 'C-011',
          endDate: '2026-12-31',
          startDate: '2026-01-01',
          status: 'ACTIVE' as const,
          supplierId: 99,
          title: 'Missing supplier',
        },
      ],
      services: [
        { id: 20, name: 'Hosting', supplierId: 1, contractId: 10, active: true },
        { id: 21, name: 'Archive', supplierId: 99, active: false },
      ],
    }

    expect(getEnrichedRows('contracts', resources)).toEqual([
      {
        contractNumber: 'C-001',
        endDate: '2026-12-31',
        id: 10,
        serviceIds: [20],
        servicesCount: 1,
        startDate: '2026-01-01',
        status: 'ACTIVE',
        supplierId: 1,
        supplierName: 'Acme',
        title: 'Support Agreement',
      },
      {
        contractNumber: 'C-011',
        endDate: '2026-12-31',
        id: 11,
        servicesCount: 0,
        startDate: '2026-01-01',
        status: 'ACTIVE',
        supplierId: 99,
        supplierName: 'Unknown Supplier',
        title: 'Missing supplier',
      },
    ])
    expect(getEnrichedRows('services', resources)).toEqual([
      {
        active: true,
        activeLabel: 'Active',
        contractId: 10,
        contractTitle: 'Support Agreement',
        id: 20,
        name: 'Hosting',
        supplierId: 1,
        supplierName: 'Acme',
      },
      {
        active: false,
        activeLabel: 'Inactive',
        contractTitle: 'Unassigned',
        id: 21,
        name: 'Archive',
        supplierId: 99,
        supplierName: 'Unknown Supplier',
      },
    ])
  })
})
