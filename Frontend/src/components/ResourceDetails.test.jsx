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
      status: 'ACTIVE',
    }
    const service = { id: 20, active: true, name: 'Helpdesk' }

    render(
      <ResourceDetails
        detail={{ contracts: [contract], services: [service] }}
        onRelatedSelect={onRelatedSelect}
        primary="Acme"
        resourceKey="suppliers"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /C-001/ }))
    fireEvent.click(screen.getByRole('button', { name: /Helpdesk/ }))

    expect(screen.getByRole('heading', { name: 'Acme' })).toBeInTheDocument()
    expect(onRelatedSelect).toHaveBeenNthCalledWith(1, 'contracts', contract)
    expect(onRelatedSelect).toHaveBeenNthCalledWith(2, 'services', service)
  })

  it('renders contract supplier and linked services', () => {
    const onRelatedSelect = vi.fn()
    const supplier = { id: 1, email: 'ops@acme.test', name: 'Acme', phone: '555-0100' }
    const service = { id: 20, active: false, name: 'Archive' }

    render(
      <ResourceDetails
        detail={{ services: [service], supplier }}
        onRelatedSelect={onRelatedSelect}
        primary="Support Agreement"
        resourceKey="contracts"
      />,
    )

    expect(screen.getByRole('button', { name: /Acme/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Archive/ })).toBeInTheDocument()
  })

  it('renders service supplier and contract fallbacks', () => {
    render(
      <ResourceDetails
        detail={{ contract: null, supplier: null }}
        onRelatedSelect={vi.fn()}
        primary="Unassigned service"
        resourceKey="services"
      />,
    )

    expect(screen.getByText('Unknown Supplier')).toBeInTheDocument()
    expect(screen.getByText('No assigned contract.')).toBeInTheDocument()
  })
})
