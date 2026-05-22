import { fireEvent, render, screen } from '@testing-library/react'
import { ResourceDetails } from './ResourceDetails'

describe('ResourceDetails', () => {
  it('renders supplier relationships and opens related records', () => {
    const onRelatedSelect = vi.fn()
    const onOpenActiveSuppliersPdf = vi.fn()
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
        onOpenActiveSuppliersPdf={onOpenActiveSuppliersPdf}
        onRelatedSelect={onRelatedSelect}
        primary="Acme"
        session={{ role: 'ADMIN', token: 'jwt-token', username: 'ada' }}
        resourceKey="suppliers"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Support Agreement/ }))
    fireEvent.click(screen.getByRole('button', { name: /Helpdesk/ }))

    expect(screen.getByRole('heading', { name: 'Acme' })).toBeInTheDocument()
    expect(onRelatedSelect).toHaveBeenNthCalledWith(1, 'contracts', contract)
    expect(onRelatedSelect).toHaveBeenNthCalledWith(2, 'services', service)
  })

  it('shows the active suppliers PDF action only to admins', () => {
    const onOpenActiveSuppliersPdf = vi.fn()

    const { rerender } = render(
      <ResourceDetails
        detail={{}}
        onOpenActiveSuppliersPdf={onOpenActiveSuppliersPdf}
        onRelatedSelect={vi.fn()}
        primary="Acme"
        session={{ role: 'USER', token: 'jwt-token', username: 'ada' }}
        resourceKey="suppliers"
      />,
    )

    expect(screen.queryByRole('button', { name: 'Open active suppliers PDF' })).not.toBeInTheDocument()

    rerender(
      <ResourceDetails
        detail={{}}
        onOpenActiveSuppliersPdf={onOpenActiveSuppliersPdf}
        onRelatedSelect={vi.fn()}
        primary="Acme"
        session={{ role: 'ADMIN', token: 'jwt-token', username: 'ada' }}
        resourceKey="suppliers"
      />,
    )

    expect(screen.getByRole('button', { name: 'Open active suppliers PDF' })).toBeInTheDocument()
  })

  it('renders contract supplier and linked services', () => {
    const onRelatedSelect = vi.fn()
    const supplier = { id: 1, email: 'ops@acme.test', name: 'Acme', phone: '555-0100', registrationCode: 'ACME-1' }
    const service = { id: 20, active: false, name: 'Archive', supplierId: 1 }

    render(
      <ResourceDetails
        detail={{ services: [service], supplier }}
        onOpenActiveSuppliersPdf={vi.fn()}
        onRelatedSelect={onRelatedSelect}
        primary="Support Agreement"
        session={{ role: 'ADMIN', token: 'jwt-token', username: 'ada' }}
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
        onOpenActiveSuppliersPdf={vi.fn()}
        onRelatedSelect={vi.fn()}
        primary="Unassigned service"
        session={{ role: 'ADMIN', token: 'jwt-token', username: 'ada' }}
        resourceKey="services"
      />,
    )

    expect(screen.getByText('Unknown Supplier')).toBeInTheDocument()
    expect(screen.getByText('No assigned contract.')).toBeInTheDocument()
  })
})
