import { navItems, resourceConfig } from './resourceConfig'

describe('resourceConfig', () => {
  it('defines navigation for every configured resource in display order', () => {
    expect(navItems).toEqual([
      { key: 'suppliers', label: 'Suppliers' },
      { key: 'contracts', label: 'Contracts' },
      { key: 'services', label: 'Services' },
    ])
    expect(navItems.map((item) => item.key)).toEqual(Object.keys(resourceConfig))
  })

  it('defines table columns that point at displayable resource fields', () => {
    for (const [resourceKey, config] of Object.entries(resourceConfig)) {
      expect(config.title).toBeTruthy()
      expect(config.singular).toBeTruthy()
      expect(config.primaryField).toBeTruthy()
      expect(config.fields.some((field) => field.name === config.primaryField)).toBe(true)

      for (const column of config.columns) {
        expect(column).toEqual({
          key: expect.any(String),
          label: expect.any(String),
        })
        expect(column.key.length).toBeGreaterThan(0)
        expect(column.label.length).toBeGreaterThan(0)
      }

      expect(resourceKey).toBe(config.title.toLowerCase())
    }
  })

  it('captures create-only identity fields and required relationships', () => {
    expect(resourceConfig.suppliers.fields.find((field) => field.name === 'registrationCode')).toMatchObject({
      createOnly: true,
      required: true,
    })
    expect(resourceConfig.contracts.fields.find((field) => field.name === 'supplierId')).toMatchObject({
      createOnly: true,
      required: true,
      resourceTarget: 'suppliers',
      type: 'resourceSelect',
    })
    expect(resourceConfig.services.fields.find((field) => field.name === 'contractId')).toMatchObject({
      resourceTarget: 'contracts',
      type: 'resourceSelect',
    })
  })

  it('uses backend enum values for status and active selectors', () => {
    expect(resourceConfig.contracts.fields.find((field) => field.name === 'status')).toMatchObject({
      options: ['ACTIVE', 'EXPIRED', 'TERMINATED'],
      type: 'select',
    })
    expect(resourceConfig.services.fields.find((field) => field.name === 'active')).toMatchObject({
      options: ['true', 'false'],
      type: 'select',
    })
  })
})
