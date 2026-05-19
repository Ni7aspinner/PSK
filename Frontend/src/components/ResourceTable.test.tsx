import { fireEvent, render, screen } from '@testing-library/react'
import { ResourceTable } from './ResourceTable'
import { resourceConfig } from '../models/resourceConfig'

describe('ResourceTable', () => {
  it('renders an empty state when there are no rows', () => {
    render(
      <ResourceTable
        busyAction=""
        closeDetails={vi.fn()}
        config={resourceConfig.suppliers}
        deleteItem={vi.fn()}
        loadDetails={vi.fn()}
        openEditModal={vi.fn()}
        openRelatedDetails={vi.fn()}
        rows={[]}
        resourceKey="suppliers"
        terminateContract={vi.fn()}
      />,
    )

    expect(screen.getByText('No suppliers found.')).toBeInTheDocument()
  })

  it('calls row actions and renders expanded details', () => {
    const row = {
      contractNumber: 'C-001',
      endDate: '2026-12-31',
      id: 10,
      servicesCount: 1,
      startDate: '2026-01-01',
      status: 'ACTIVE' as const,
      supplierId: 1,
      supplierName: 'Acme',
      title: 'Support Agreement',
    }
    const deleteItem = vi.fn()
    const loadDetails = vi.fn()
    const closeDetails = vi.fn()
    const openEditModal = vi.fn()
    const openRelatedDetails = vi.fn()
    const terminateContract = vi.fn()

    const { rerender } = render(
      <ResourceTable
        busyAction=""
        closeDetails={closeDetails}
        config={resourceConfig.contracts}
        deleteItem={deleteItem}
        loadDetails={loadDetails}
        openEditModal={openEditModal}
        openRelatedDetails={openRelatedDetails}
        resourceKey="contracts"
        rows={[row]}
        terminateContract={terminateContract}
      />,
    )

    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.click(screen.getByTitle('Terminate Contract'))
    fireEvent.click(screen.getByTitle('Delete'))
    fireEvent.click(screen.getByTitle('Expand details'))

    expect(openEditModal).toHaveBeenCalledWith('contracts', row)
    expect(terminateContract).toHaveBeenCalledWith(row)
    expect(deleteItem).toHaveBeenCalledWith('contracts', row)
    expect(loadDetails).toHaveBeenCalledWith('contracts', row)

    rerender(
      <ResourceTable
        busyAction=""
        closeDetails={closeDetails}
        config={resourceConfig.contracts}
        deleteItem={deleteItem}
        expandedDetails={{ item: row, services: [], supplier: { id: 1, name: 'Acme', registrationCode: 'ACME-1' } }}
        loadDetails={loadDetails}
        openEditModal={openEditModal}
        openRelatedDetails={openRelatedDetails}
        resourceKey="contracts"
        rows={[row]}
        selected={row}
        terminateContract={terminateContract}
      />,
    )

    expect(screen.getByRole('heading', { name: 'C-001' })).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Collapse details'))
    expect(closeDetails).toHaveBeenCalledWith('contracts')
  })
})
