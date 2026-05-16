import PropTypes from 'prop-types'

function AuthScreen({ actions, heroMark, state }) {
  const { authError, authMode, loading, registerSuccess } = state
  const { changeAuthMode, register, signIn } = actions
  const actionLabel = authMode === 'login' ? 'Sign in' : 'Register'
  const submitLabel = loading ? 'Working...' : actionLabel

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-label="Authentication">
        <div className="auth-copy">
          <img src={heroMark} alt="PSK logo" className="auth-mark" />
        </div>

        <form className="auth-form" onSubmit={authMode === 'login' ? signIn : register}>
          <div className="auth-heading">
            <p className="kicker">{authMode === 'login' ? 'Welcome back' : 'New account'}</p>
            <h2>{authMode === 'login' ? 'Sign in' : 'Register'}</h2>
          </div>
          {authMode === 'login' ? (
            <>
              <label>
                <span>Username</span>
                <input name="username" autoComplete="username" required />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
            </>
          ) : (
            <>
              <label>
                <span>New username</span>
                <input name="username" autoComplete="username" required />
              </label>
              <label>
                <span>New password</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
            </>
          )}
          {authError && <p className="alert-text">{authError}</p>}
          {registerSuccess && <p className="success-text">{registerSuccess}</p>}
          <button type="submit" className="primary-action" disabled={loading}>
            {submitLabel}
          </button>
          <button type="button" className="link-action" onClick={changeAuthMode}>
            {authMode === 'login' ? 'Create account' : 'Back to sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

AuthScreen.propTypes = {
  actions: PropTypes.shape({
    changeAuthMode: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    signIn: PropTypes.func.isRequired,
  }).isRequired,
  heroMark: PropTypes.string.isRequired,
  state: PropTypes.shape({
    authError: PropTypes.string.isRequired,
    authMode: PropTypes.oneOf(['login', 'register']).isRequired,
    loading: PropTypes.bool.isRequired,
    registerSuccess: PropTypes.string.isRequired,
  }).isRequired,
}

export { AuthScreen }
