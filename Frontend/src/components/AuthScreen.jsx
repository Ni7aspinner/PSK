function AuthScreen({ actions, heroMark, state }) {
  const { authError, authMode, loading, registerSuccess } = state
  const { changeAuthMode, register, signIn } = actions

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
                Username
                <input name="username" autoComplete="username" required />
              </label>
              <label>
                Password
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
            </>
          ) : (
            <>
              <label>
                New username
                <input name="username" autoComplete="username" required />
              </label>
              <label>
                New password
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
            {loading ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Register'}
          </button>
          <button type="button" className="link-action" onClick={changeAuthMode}>
            {authMode === 'login' ? 'Create account' : 'Back to sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export { AuthScreen }
