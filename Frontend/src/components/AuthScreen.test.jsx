import { fireEvent, render, screen } from '@testing-library/react'
import { AuthScreen } from './AuthScreen'

const heroMark = '/hero.png'

function renderAuthScreen(stateOverrides = {}, actionOverrides = {}) {
  const actions = {
    changeAuthMode: vi.fn(),
    register: vi.fn((event) => event.preventDefault()),
    signIn: vi.fn((event) => event.preventDefault()),
    ...actionOverrides,
  }

  render(
    <AuthScreen
      actions={actions}
      heroMark={heroMark}
      state={{
        authError: '',
        authMode: 'login',
        loading: false,
        registerSuccess: '',
        ...stateOverrides,
      }}
    />,
  )

  return actions
}

describe('AuthScreen', () => {
  it('renders the login form and submits sign-in credentials', () => {
    const actions = renderAuthScreen()

    expect(screen.getByRole('img', { name: 'PSK logo' })).toHaveAttribute('src', heroMark)
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password')

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'ada' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(actions.signIn).toHaveBeenCalledTimes(1)
    expect(actions.changeAuthMode).toHaveBeenCalledTimes(1)
  })

  it('renders the registration form and submits registration credentials', () => {
    const actions = renderAuthScreen({
      authMode: 'register',
      registerSuccess: 'Registered ada. You can sign in now.',
    })

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument()
    expect(screen.getByLabelText('New password')).toHaveAttribute('autocomplete', 'new-password')
    expect(screen.getByLabelText('New password')).toHaveAttribute('minlength', '6')
    expect(screen.getByText('Registered ada. You can sign in now.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('New username'), { target: { value: 'ada' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Register' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back to sign in' }))

    expect(actions.register).toHaveBeenCalledTimes(1)
    expect(actions.changeAuthMode).toHaveBeenCalledTimes(1)
  })

  it('shows auth errors and disables submit while loading', () => {
    renderAuthScreen({
      authError: 'Invalid credentials.',
      loading: true,
    })

    expect(screen.getByText('Invalid credentials.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Working...' })).toBeDisabled()
  })
})
