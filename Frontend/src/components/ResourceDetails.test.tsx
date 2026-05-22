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

  it('renders contract services and opens service creation with contract defaults', () => {
    const openCreateModal = vi.fn()
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
        detail={{ item: contract, services: [service] }}
        openCreateModal={openCreateModal}
        onRelatedSelect={onRelatedSelect}
        resourceKey="contracts"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add service' }))

    expect(screen.getByRole('button', { name: /Archive/ })).toBeInTheDocument()
    expect(openCreateModal).toHaveBeenCalledWith('services', { contractId: 10, supplierId: 1 })
  })

  it('renders service contract fallback and opens contract creation with supplier defaults', () => {
    const openCreateModal = vi.fn()
    render(
      <ResourceDetails
        detail={{ contract: null, item: { id: 20, active: true, name: 'Helpdesk', supplierId: 1 } }}
        openCreateModal={openCreateModal}
        onRelatedSelect={vi.fn()}
        resourceKey="services"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add contract' }))

    expect(screen.getByText('No assigned contract.')).toBeInTheDocument()
    expect(openCreateModal).toHaveBeenCalledWith('contracts', { supplierId: 1 })
  })
})
