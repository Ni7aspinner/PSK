import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { backendApi } from './api/backendApi'

vi.mock('./api/backendApi', () => ({
  backendApi: {
    getContracts: vi.fn(),
    getServices: vi.fn(),
    getSuppliers: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  },
}))

const session = { role: 'ADMIN', token: 'jwt-token', username: 'ada' }

function mockDashboardResources() {
  backendApi.getSuppliers.mockResolvedValue([
    { id: 1, email: 'ops@acme.test', name: 'Acme', phone: '555-0100', registrationCode: 'ACME-1' },
  ])
  backendApi.getContracts.mockResolvedValue([
    {
      id: 10,
      contractNumber: 'C-001',
      endDate: '2026-12-31',
      startDate: '2026-01-01',
      status: 'ACTIVE',
      supplierId: 1,
      title: 'Support Agreement',
    },
  ])
  backendApi.getServices.mockResolvedValue([
    { id: 20, active: true, contractId: 10, description: '24/7 helpdesk', name: 'Helpdesk', supplierId: 1 },
  ])
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockDashboardResources()
  })

  it('signs in, stores the session, and renders dashboard resources', async () => {
    backendApi.login.mockResolvedValue(session)

    render(<App />)

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ada' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Signed in as ada · ADMIN')).toBeInTheDocument()
    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Suppliers 1/ })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('psk-session'))).toEqual(session)
    expect(backendApi.login).toHaveBeenCalledWith({ username: 'ada', password: 'secret' })
    expect(backendApi.getSuppliers).toHaveBeenCalledWith(session)
  })

  it('shows authentication errors without entering the dashboard', async () => {
    backendApi.login.mockRejectedValue(new Error('Invalid credentials.'))

    render(<App />)

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ada' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument()
    expect(screen.queryByText(/Signed in as/)).not.toBeInTheDocument()
    expect(localStorage.getItem('psk-session')).toBeNull()
  })

  it('registers a user, returns to sign in, and shows the success message', async () => {
    backendApi.register.mockResolvedValue({ username: 'new-user' })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    fireEvent.change(screen.getByLabelText('New username'), { target: { value: 'new-user' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText('Registered new-user. You can sign in now.')).toBeInTheDocument()
    expect(backendApi.register).toHaveBeenCalledWith({ username: 'new-user', password: 'secret1' })
  })

  it('loads the dashboard from a stored session and signs out', async () => {
    localStorage.setItem('psk-session', JSON.stringify(session))

    render(<App />)

    expect(await screen.findByText('Signed in as ada · ADMIN')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })
    expect(localStorage.getItem('psk-session')).toBeNull()
  })
})
