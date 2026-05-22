import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Dashboard } from './Dashboard'
import { backendApi } from '../api/backendApi'

vi.mock('../api/backendApi', () => ({
  backendApi: {
    createContact: vi.fn(),
    createSupplier: vi.fn(),
    deleteContact: vi.fn(),
    deleteSupplier: vi.fn(),
    getContact: vi.fn(),
    getContacts: vi.fn(),
    getContract: vi.fn(),
    getContracts: vi.fn(),
    getActiveSuppliersReport: vi.fn(),
    getService: vi.fn(),
    getServices: vi.fn(),
    getSupplier: vi.fn(),
    getSupplierContacts: vi.fn(),
    getSupplierServices: vi.fn(),
    getSuppliers: vi.fn(),
    setPrimaryContact: vi.fn(),
    terminateContract: vi.fn(),
    updateContact: vi.fn(),
    updateService: vi.fn(),
    updateSupplier: vi.fn(),
  },
}))

const session = { role: 'ADMIN', token: 'jwt-token', username: 'ada' }
const api = vi.mocked(backendApi)

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
  status: 'ACTIVE' as const,
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

const contact = {
  id: 30,
  email: 'ada@acme.test',
  firstName: 'Ada',
  lastName: 'Lovelace',
  phone: '555-0130',
  position: 'Account Manager',
  primary: false,
  supplierId: 1,
  version: 1,
}

function mockLoad() {
  api.getSuppliers.mockResolvedValue([supplier])
  api.getContacts.mockResolvedValue([contact])
  api.getContracts.mockResolvedValue([contract])
  api.getServices.mockResolvedValue([service])
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
    expect(screen.getByRole('button', { name: /Contacts 1/ })).toBeInTheDocument()
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

    api.createSupplier.mockResolvedValue(newSupplier)
    api.updateSupplier.mockResolvedValue(updatedSupplier)
    api.getSupplier.mockResolvedValue(updatedSupplier)
    api.getSupplierContacts.mockResolvedValue([contact])
    api.getSupplierServices.mockResolvedValue([service])
    api.deleteSupplier.mockResolvedValue(null)

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    expect(await screen.findByText('Acme')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Create supplier' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Beta' } })
    fireEvent.change(screen.getByLabelText('Registration code'), { target: { value: 'B-2' } })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Create supplier' }))

    expect(await screen.findByText('Beta')).toBeInTheDocument()
    expect(api.createSupplier).toHaveBeenCalledWith(session, {
      name: 'Beta',
      registrationCode: 'B-2',
    })

    fireEvent.click(screen.getAllByTitle('Edit')[0])
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Acme Updated' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update supplier' }))

    expect(await screen.findByText('Acme Updated')).toBeInTheDocument()
    expect(api.updateSupplier).toHaveBeenCalledWith(session, 1, {
      email: 'ops@acme.test',
      name: 'Acme Updated',
      phone: '555-0100',
      version: 4,
    })

    fireEvent.click(screen.getAllByTitle('Expand details')[0])

    expect(await screen.findByRole('heading', { name: 'Acme Updated' })).toBeInTheDocument()
    expect(screen.getByText('Related contracts')).toBeInTheDocument()
    expect(screen.getByText('Related contacts')).toBeInTheDocument()
    expect(screen.getByText('Related services')).toBeInTheDocument()
    expect(api.getSupplier).toHaveBeenCalledWith(session, 1)
    expect(api.getSupplierContacts).toHaveBeenCalledWith(session, 1)
    expect(api.getSupplierServices).toHaveBeenCalledWith(session, 1)

    fireEvent.click(screen.getAllByTitle('Delete')[0])

    await waitFor(() => {
      expect(screen.queryByText('Acme Updated')).not.toBeInTheDocument()
    })
    expect(api.deleteSupplier).toHaveBeenCalledWith(session, 1)
  })

  it('terminates active contracts from the contracts table', async () => {
    api.terminateContract.mockResolvedValue({ ...contract, status: 'TERMINATED' })

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    await screen.findByText('Acme')
    fireEvent.click(screen.getByRole('button', { name: /Contracts 1/ }))

    const table = screen.getByRole('table')
    expect(within(table).getByText('ACTIVE')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Terminate Contract'))

    await waitFor(() => {
      expect(within(table).getByText('TERMINATED')).toBeInTheDocument()
    })
    expect(api.terminateContract).toHaveBeenCalledWith(session, 10)
  })

  it('preserves inactive services when editing without changing status', async () => {
    const inactiveService = { ...service, active: false, name: 'Archive' }
    api.getServices.mockResolvedValue([inactiveService])
    api.updateService.mockResolvedValue(inactiveService)

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    await screen.findByText('Acme')
    fireEvent.click(screen.getByRole('button', { name: /Services 1/ }))
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.click(screen.getByRole('button', { name: 'Update service' }))

    await waitFor(() => {
      expect(api.updateService).toHaveBeenCalledWith(session, 20, {
        active: false,
        contractId: 10,
        description: '24/7 helpdesk',
        name: 'Archive',
        supplierId: 1,
        version: 2,
      })
    })
  })

  it('clears an optional service contract when editing', async () => {
    api.updateService.mockResolvedValue({ ...service, contractId: null })

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    await screen.findByText('Acme')
    fireEvent.click(screen.getByRole('button', { name: /Services 1/ }))
    fireEvent.click(screen.getByTitle('Edit'))
    fireEvent.change(screen.getByLabelText('Contract'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update service' }))

    await waitFor(() => {
      expect(api.updateService).toHaveBeenCalledWith(session, 20, {
        active: true,
        description: '24/7 helpdesk',
        name: 'Helpdesk',
        supplierId: 1,
        version: 2,
      })
    })
  })

  it('shows a load error when resources cannot be fetched', async () => {
    api.getSuppliers.mockRejectedValue(new Error('Unable to reach API.'))

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    expect(await screen.findByText('Unable to reach API.')).toBeInTheDocument()
    expect(screen.getByText('No suppliers found.')).toBeInTheDocument()
  })

  it('loads and filters the active suppliers report', async () => {
    api.getActiveSuppliersReport.mockResolvedValue({
      generatedAt: '2026-05-22T10:00:00Z',
      rows: [
        {
          activeContracts: 1,
          activeServices: 2,
          name: 'Acme',
          registrationCode: 'ACME-1',
          supplierId: 1,
        },
        {
          activeContracts: 0,
          activeServices: 0,
          name: 'Beta',
          registrationCode: 'BETA-2',
          supplierId: 2,
        },
      ],
    })

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    await screen.findByText('Acme')
    fireEvent.click(screen.getByRole('button', { name: /Reports/ }))

    expect(await screen.findByRole('heading', { name: 'Active suppliers report' })).toBeInTheDocument()
    expect(api.getActiveSuppliersReport).toHaveBeenCalledWith(session)
    expect(screen.getByText('ACME-1')).toBeInTheDocument()
    expect(screen.getByText('BETA-2')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search suppliers...'), { target: { value: 'Beta' } })

    expect(screen.queryByText('ACME-1')).not.toBeInTheDocument()
    expect(screen.getByText('BETA-2')).toBeInTheDocument()
  })

  it('does not repeatedly reload a failed report until refresh is clicked', async () => {
    api.getActiveSuppliersReport.mockRejectedValueOnce(new Error('Report unavailable.'))
    api.getActiveSuppliersReport.mockResolvedValueOnce({
      generatedAt: '2026-05-22T10:00:00Z',
      rows: [
        {
          activeContracts: 1,
          activeServices: 2,
          name: 'Acme',
          registrationCode: 'ACME-1',
          supplierId: 1,
        },
      ],
    })

    render(<Dashboard session={session} onSignOut={vi.fn()} />)

    await screen.findByText('Acme')
    fireEvent.click(screen.getByRole('button', { name: /Reports/ }))

    expect(await screen.findByText('Report unavailable.')).toBeInTheDocument()
    expect(api.getActiveSuppliersReport).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Refresh report' }))

    expect(await screen.findByText('ACME-1')).toBeInTheDocument()
    expect(api.getActiveSuppliersReport).toHaveBeenCalledTimes(2)
  })
})
