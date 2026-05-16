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

function formWith(values) {
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

    expect(formPayload(form, [
      { name: 'name' },
      { name: 'active', type: 'select' },
      { name: 'supplierId', type: 'number' },
      { name: 'contractId', type: 'number' },
    ], 'create')).toEqual({
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

    expect(formPayload(form, [
      { name: 'name' },
      { name: 'registrationCode', createOnly: true },
    ], 'edit', { id: 1, version: 3 })).toEqual({
      name: 'Updated Supplier',
      version: 3,
    })
  })

  it('replaces matching rows by id without changing other rows', () => {
    expect(replaceById([
      { id: 1, name: 'Old' },
      { id: 2, name: 'Same' },
    ], { id: 1, name: 'New' })).toEqual([
      { id: 1, name: 'New' },
      { id: 2, name: 'Same' },
    ])
  })

  it('removes matching rows by id without changing other rows', () => {
    expect(removeById([
      { id: 1, name: 'Remove' },
      { id: 2, name: 'Keep' },
    ], 1)).toEqual([
      { id: 2, name: 'Keep' },
    ])
  })

  it('formats resource labels from resource-specific primary fields', () => {
    expect(resourceLabel('suppliers', { name: 'Acme' })).toBe('Acme')
    expect(resourceLabel('contracts', { contractNumber: 'C-001' })).toBe('C-001')
    expect(resourceLabel('contracts', { title: 'Support Agreement' })).toBe('Support Agreement')
    expect(resourceLabel('services', null)).toBe('-')
  })

  it('finds related contracts and services', () => {
    const contracts = [
      { id: 10, supplierId: 1 },
      { id: 11, supplierId: 2 },
    ]
    const services = [
      { id: 20, contractId: 10 },
      { id: 21, contractId: 99 },
      { id: 22 },
    ]

    expect(contractsForSupplier(contracts, 1)).toEqual([{ id: 10, supplierId: 1 }])
    expect(servicesForContract(services, { id: 10, serviceIds: [21] })).toEqual([
      { id: 20, contractId: 10 },
      { id: 21, contractId: 99 },
    ])
  })

  it('enriches contract and service rows for display', () => {
    const resources = {
      suppliers: [{ id: 1, name: 'Acme' }],
      contracts: [
        { id: 10, contractNumber: 'C-001', supplierId: 1, serviceIds: [20] },
        { id: 11, title: 'Missing supplier', supplierId: 99 },
      ],
      services: [
        { id: 20, name: 'Hosting', supplierId: 1, contractId: 10, active: true },
        { id: 21, name: 'Archive', supplierId: 99, active: false },
      ],
    }

    expect(getEnrichedRows('contracts', resources)).toEqual([
      {
        contractNumber: 'C-001',
        id: 10,
        serviceIds: [20],
        servicesCount: 1,
        supplierId: 1,
        supplierName: 'Acme',
      },
      {
        id: 11,
        servicesCount: 0,
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
        contractTitle: 'C-001',
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
