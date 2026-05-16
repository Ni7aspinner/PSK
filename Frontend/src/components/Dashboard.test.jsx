import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { backendApi } from '../api/backendApi'

vi.mock('../api/backendApi', () => ({
  backendApi: {
    createSupplier: vi.fn(),
    deleteSupplier: vi.fn(),
    getContract: vi.fn(),
    getContracts: vi.fn(),
    getService: vi.fn(),
    getServices: vi.fn(),
    getSupplier: vi.fn(),
    getSupplierServices: vi.fn(),
    getSuppliers: vi.fn(),
    terminateContract: vi.fn(),
    updateService: vi.fn(),
    updateSupplier: vi.fn(),
  },
}))

const session = { role: 'ADMIN', token: 'jwt-token', username: 'ada' }

const supplier = {
  id: 1,
  email: 'ops@acme.test',
  name: 'Acme',
  phone: '555-0100',
  registrationCode: 'ACME-1',
  version: 4,
}

const contract = {
  id: 10,
  contractNumber: 'C-001',
  endDate: '2026-12-31',
  serviceIds: [20],
  startDate: '2026-01-01',
  status: 'ACTIVE',
  supplierId: 1,
  title: 'Support Agreement',
}

const service = {
  id: 20,
  active: true,
  contractId: 10,
  description: '24/7 helpdesk',
  name: 'Helpdesk',
  supplierId: 1,
  version: 2,
}

function mockLoad() {
  backendApi.getSuppliers.mockResolvedValue([supplier])
  backendApi.getContracts.mockResolvedValue([contract])
  backendApi.getServices.mockResolvedValue([service])
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoad()
  })

  it('loads resources and switches between resource pages', async () => {
    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Suppliers 1/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Contracts 1/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Services 1/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Contracts 1/ }))

    expect(screen.getByText('C-001')).toBeInTheDocument()
    expect(screen.getByText('Support Agreement')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '1 records' })).toBeInTheDocument()
  })

  it('creates, edits, expands, and deletes supplier records', async () => {
    const updatedSupplier = { ...supplier, name: 'Acme Updated' }
    const newSupplier = {
      id: 2,
      email: '',
      name: 'Beta',
      phone: '',
      registrationCode: 'B-2',
      version: 1,
    }

    backendApi.createSupplier.mockResolvedValue(newSupplier)
    backendApi.updateSupplier.mockResolvedValue(updatedSupplier)
    backendApi.getSupplier.mockResolvedValue(updatedSupplier)
    backendApi.getSupplierServices.mockResolvedValue([service])
    backendApi.deleteSupplier.mockResolvedValue(null)

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    expect(await screen.findByText('Acme')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Create supplier' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Beta' } })
    fireEvent.change(screen.getByLabelText('Registration code'), { target: { value: 'B-2' } })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Create supplier' }))

    expect(await screen.findByText('Beta')).toBeInTheDocument()
    expect(backendApi.createSupplier).toHaveBeenCalledWith(session, {
      name: 'Beta',
      registrationCode: 'B-2',
    })

    fireEvent.click(screen.getAllByTitle('Edit')[0])
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Acme Updated' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update supplier' }))

    expect(await screen.findByText('Acme Updated')).toBeInTheDocument()
    expect(backendApi.updateSupplier).toHaveBeenCalledWith(session, 1, {
      email: 'ops@acme.test',
      name: 'Acme Updated',
      phone: '555-0100',
      version: 4,
    })

    fireEvent.click(screen.getAllByTitle('Expand details')[0])

    expect(await screen.findByRole('heading', { name: 'Acme Updated' })).toBeInTheDocument()
    expect(screen.getByText('Related contracts')).toBeInTheDocument()
    expect(screen.getByText('Related services')).toBeInTheDocument()
    expect(backendApi.getSupplier).toHaveBeenCalledWith(session, 1)
    expect(backendApi.getSupplierServices).toHaveBeenCalledWith(session, 1)

    fireEvent.click(screen.getAllByTitle('Delete')[0])

    await waitFor(() => {
      expect(screen.queryByText('Acme Updated')).not.toBeInTheDocument()
    })
    expect(backendApi.deleteSupplier).toHaveBeenCalledWith(session, 1)
  })

  it('terminates active contracts from the contracts table', async () => {
    backendApi.terminateContract.mockResolvedValue({ id: 10, status: 'TERMINATED' })

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    await screen.findByText('Acme')
    fireEvent.click(screen.getByRole('button', { name: /Contracts 1/ }))

    const table = screen.getByRole('table')
    expect(within(table).getByText('ACTIVE')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Terminate Contract'))

    await waitFor(() => {
      expect(within(table).getByText('TERMINATED')).toBeInTheDocument()
    })
    expect(backendApi.terminateContract).toHaveBeenCalledWith(session, 10)
  })

  it('preserves inactive services when editing without changing status', async () => {
    const inactiveService = { ...service, active: false, name: 'Archive' }
    backendApi.getServices.mockResolvedValue([inactiveService])
    backendApi.updateService.mockResolvedValue(inactiveService)

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    await screen.findByText('Acme')
    fireEvent.click(screen.getByRole('button', { name: /Services 1/ }))
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.click(screen.getByRole('button', { name: 'Update service' }))

    await waitFor(() => {
      expect(backendApi.updateService).toHaveBeenCalledWith(session, 20, {
        active: false,
        contractId: '10',
        description: '24/7 helpdesk',
        name: 'Archive',
        supplierId: '1',
        version: 2,
      })
    })
  })

  it('shows a load error when resources cannot be fetched', async () => {
    backendApi.getSuppliers.mockRejectedValue(new Error('Unable to reach API.'))

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    expect(await screen.findByText('Unable to reach API.')).toBeInTheDocument()
    expect(screen.getByText('No suppliers found.')).toBeInTheDocument()
  })
})
