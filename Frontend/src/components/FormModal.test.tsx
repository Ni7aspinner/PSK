import { fireEvent, render, screen } from '@testing-library/react'
import { FormModal } from './FormModal'
import { resourceConfig } from '../models/resourceConfig'

describe('FormModal', () => {
  it('renders create fields with related resource options and submits the form', () => {
    const onClose = vi.fn()
    const onSubmit = vi.fn((event) => event.preventDefault())

    render(
      <FormModal
        busy={false}
        config={resourceConfig.services}
        mode="create"
        resources={{
          contracts: [
            {
              id: 10,
              contractNumber: 'C-001',
              endDate: '2026-12-31',
              startDate: '2026-01-01',
              status: 'ACTIVE',
              supplierId: 1,
              title: 'Support Agreement',
            },
          ],
          suppliers: [{ id: 1, name: 'Acme', registrationCode: 'ACME-1' }],
        }}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Create service' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Acme' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Support Agreement' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Helpdesk' } })
    fireEvent.change(screen.getByLabelText('Supplier'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create service' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('omits create-only fields when editing and disables the submit button while busy', () => {
    render(
      <FormModal
        busy
        config={resourceConfig.suppliers}
        item={{
          id: 1,
          email: 'ops@acme.test',
          name: 'Acme',
          phone: '555-0100',
          registrationCode: 'ACME-1',
        }}
        mode="edit"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Update supplier' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveValue('Acme')
    expect(screen.queryByLabelText('Registration code')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Working...' })).toBeDisabled()
  })
})
