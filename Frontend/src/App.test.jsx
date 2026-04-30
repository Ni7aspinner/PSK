import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads and renders fetched rows', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, name: 'Alpha' }],
    })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /fetch data/i }))

    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Rows: 1')).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /fetch data/i }))

    expect(await screen.findByText('Cannot reach API getData.')).toBeInTheDocument()
  })

  it('shows the loading state while a request is pending', async () => {
    let resolveRequest
    const pendingRequest = new Promise((resolve) => {
      resolveRequest = resolve
    })

    vi.spyOn(globalThis, 'fetch').mockReturnValue(pendingRequest)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /fetch data/i }))

    expect(screen.getByText('Loading data...')).toBeInTheDocument()

    resolveRequest({ ok: true, json: async () => [] })

    await waitFor(() => {
      expect(screen.getByText('No data loaded yet.')).toBeInTheDocument()
    })
  })
})