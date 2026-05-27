import { fireEvent, render, screen } from '@testing-library/react'
import { ResourceDetails } from './ResourceDetails'

describe('ResourceDetails', () => {
  it('renders supplier relationships and opens related records', () => {
    const onRelatedSelect = vi.fn()
    const contract = {
      id: 10,
      contractNumber: 'C-001',
      endDate: '2026-12-31',
      startDate: '2026-01-01',
      status: 'ACTIVE' as const,
      supplierId: 1,
      title: 'Support Agreement',
    }
    const service = { id: 20, active: true, name: 'Helpdesk', supplierId: 1 }

    render(
      <ResourceDetails
        detail={{ contracts: [contract], services: [service] }}
        onRelatedSelect={onRelatedSelect}
        resourceKey="suppliers"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Support Agreement/ }))
    fireEvent.click(screen.getByRole('button', { name: /Helpdesk/ }))

    expect(screen.getByRole('heading', { name: 'Related contracts' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Related contacts' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Related services' })).toBeInTheDocument()
    expect(onRelatedSelect).toHaveBeenNthCalledWith(1, 'contracts', contract)
    expect(onRelatedSelect).toHaveBeenNthCalledWith(2, 'services', service)
  })

  it('renders empty supplier relationship sections', () => {
    render(
      <ResourceDetails
        detail={{}}
        onRelatedSelect={vi.fn()}
        resourceKey="suppliers"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Related contracts' })).toBeInTheDocument()
    expect(screen.getByText('No related contracts.')).toBeInTheDocument()
  })

  it('renders contract supplier and linked services', () => {
    const onRelatedSelect = vi.fn()
    const contract = {
      id: 10,
      contractNumber: 'C-001',
      endDate: '2026-12-31',
      startDate: '2026-01-01',
      status: 'ACTIVE' as const,
      supplierId: 1,
      title: 'Support Agreement',
    }
    const service = { id: 20, active: false, name: 'Archive', supplierId: 1 }

    render(
      <ResourceDetails
        detail={{ item: contract, services: [service], supplier: { id: 1, name: 'Acme', registrationCode: 'ACME-1' } }}
        onRelatedSelect={onRelatedSelect}
        resourceKey="contracts"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Archive/ }))
    fireEvent.click(screen.getByRole('button', { name: /Acme/ }))

    expect(screen.getByRole('button', { name: /Archive/ })).toBeInTheDocument()
    expect(onRelatedSelect).toHaveBeenNthCalledWith(1, 'services', service)
    expect(onRelatedSelect).toHaveBeenNthCalledWith(
      2,
      'suppliers',
      expect.objectContaining({ id: 1, name: 'Acme' }),
    )
  })

  it('renders service supplier and contract fallback', () => {
    render(
      <ResourceDetails
        detail={{
          contract: null,
          item: { id: 20, active: true, name: 'Helpdesk', supplierId: 1 },
          supplier: { id: 1, name: 'Acme', registrationCode: 'ACME-1' },
        }}
        onRelatedSelect={vi.fn()}
        resourceKey="services"
      />,
    )

    expect(screen.getByRole('button', { name: /Acme/ })).toBeInTheDocument()
    expect(screen.getByText('No assigned contract.')).toBeInTheDocument()
  })
})
