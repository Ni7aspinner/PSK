import { useState, type FormEvent } from 'react'
import type { AuthMode } from '../models/resourceConfig'
import './LandingPage.css'

type AuthScreenProps = Readonly<{
  actions: Readonly<{
    changeAuthMode: () => void
    register: (event: FormEvent<HTMLFormElement>) => void
    signIn: (event: FormEvent<HTMLFormElement>) => void
  }>
  heroMark: string
  state: Readonly<{
    authError: string
    authMode: AuthMode
    loading: boolean
    registerSuccess: string
  }>
}>

function AuthScreen({ actions, heroMark, state }: Readonly<AuthScreenProps>) {
  const { authError, authMode, loading, registerSuccess } = state
  const { changeAuthMode, register, signIn } = actions
  const actionLabel = authMode === 'login' ? 'Sign in' : 'Register'
  const submitLabel = loading ? 'Working...' : actionLabel

  const [activeTab, setActiveTab] = useState<'suppliers' | 'contracts' | 'contacts' | 'services'>('suppliers')

  const renderIcon = (type: 'supplier' | 'contract' | 'contact' | 'service') => {
    if (type === 'supplier' || type === 'contact') {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
    if (type === 'contract') {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    }
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    )
  }

  const renderSandboxData = () => {
    switch (activeTab) {
      case 'suppliers':
        return (
          <>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('supplier')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Acme Corporation</span>
                  <span className="sandbox-item-subtitle">ops@acme.test · Phone 555-0100</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">ACME-1</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('supplier')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Global Tech Solutions</span>
                  <span className="sandbox-item-subtitle">services@global.test · Phone 555-0240</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">GLB-9</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('supplier')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Zenith Logistics</span>
                  <span className="sandbox-item-subtitle">contact@zenith.test · Phone 555-0312</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">ZEN-4</span>
            </div>
          </>
        )
      case 'contracts':
        return (
          <>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('contract')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Support Agreement</span>
                  <span className="sandbox-item-subtitle">No. C-001 · Ends Dec 31, 2026</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">ACTIVE</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('contract')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Licensing SLA</span>
                  <span className="sandbox-item-subtitle">No. C-004 · Ended Mar 15, 2026</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-expired">EXPIRED</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('contract')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Infrastructure Lease</span>
                  <span className="sandbox-item-subtitle">No. C-009 · Revoked May 01, 2026</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-terminated">TERMINATED</span>
            </div>
          </>
        )
      case 'contacts':
        return (
          <>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('contact')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Jane Doe</span>
                  <span className="sandbox-item-subtitle">ops@acme.test · Phone 555-0102</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">PRIMARY</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('contact')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">John Smith</span>
                  <span className="sandbox-item-subtitle">sales@global.test · Phone 555-0244</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">GLB-9</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('contact')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Alice Johnson</span>
                  <span className="sandbox-item-subtitle">contact@zenith.test · Phone 555-0315</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">ZEN-4</span>
            </div>
          </>
        )
      case 'services':
        return (
          <>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('service')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">24/7 Helpdesk Support</span>
                  <span className="sandbox-item-subtitle">Assigned to Acme Corp · 99.9% Resolution</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">ACTIVE</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('service')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Cloud Server Instances</span>
                  <span className="sandbox-item-subtitle">Assigned to Global Tech · High Performance</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-active">ACTIVE</span>
            </div>
            <div className="sandbox-row">
              <div className="sandbox-item-info">
                <div className="sandbox-item-icon">{renderIcon('service')}</div>
                <div className="sandbox-item-details">
                  <span className="sandbox-item-title">Legacy Database Backup</span>
                  <span className="sandbox-item-subtitle">Assigned to Zenith Logistics · Offline</span>
                </div>
              </div>
              <span className="sandbox-item-badge badge-terminated">INACTIVE</span>
            </div>
          </>
        )
    }
  }

  return (
    <main className="landing-container">
      <div className="landing-noise" />
      <div className="landing-grid-bg" />
      <div className="landing-glow-1" />
      <div className="landing-glow-2" />

      <header className="landing-header">
        <div className="landing-logo">
          <div className="landing-logo-icon">P</div>
          <span className="landing-logo-text">
            PSK<span className="landing-logo-slash">//</span>KERNEL
          </span>
        </div>
      </header>

      <div className="landing-shell">
        <div className="landing-main-grid">

          <div className="landing-brand-panel">
            <div className="brand-hero">
              <span className="brand-kicker">Core Procurement Engine</span>
              <h1>
                The single kernel for <br />
                <em>enterprise</em> partnerships.
              </h1>
            </div>

            <div className="sandbox-widget">
              <div className="sandbox-bar">
                <div className="sandbox-controls">
                  <span className="sandbox-dot close" />
                  <span className="sandbox-dot minimize" />
                  <span className="sandbox-dot maximize" />
                </div>
                <div className="sandbox-tabs">
                  <button
                    type="button"
                    className={`sandbox-tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suppliers')}
                  >
                    Suppliers
                  </button>
                  <button
                    type="button"
                    className={`sandbox-tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contracts')}
                  >
                    Contracts
                  </button>
                  <button
                    type="button"
                    className={`sandbox-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contacts')}
                  >
                    Contacts
                  </button>
                  <button
                    type="button"
                    className={`sandbox-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveTab('services')}
                  >
                    Services
                  </button>
                </div>
              </div>
              <div className="sandbox-content" key={activeTab}>
                {renderSandboxData()}
              </div>
            </div>
          </div>

          <div className="landing-auth-panel">
            <section className="auth-card-upgraded" aria-label="Authentication">
              <img src={heroMark} alt="PSK logo" className="auth-mark-hidden" />

              <div className="auth-header-upgrade">
                <div className="auth-logo-row">
                  <span className="kicker" style={{ margin: 0 }}>
                    {authMode === 'login' ? 'SECURE ENTRY PORTAL' : 'ACCOUNT CREATION'}
                  </span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fafafa', margin: 0 }}>
                  {authMode === 'login' ? 'Sign in' : 'Register'}
                </h2>
              </div>

              <form className="auth-form-upgrade" onSubmit={authMode === 'login' ? signIn : register}>
                {authMode === 'login' ? (
                  <>
                    <div className="auth-field-group">
                      <label htmlFor="username-input">Username</label>
                      <input
                        id="username-input"
                        className="auth-input-upgraded"
                        name="username"
                        autoComplete="username"
                        required
                      />
                    </div>
                    <div className="auth-field-group">
                      <label htmlFor="password-input">Password</label>
                      <input
                        id="password-input"
                        className="auth-input-upgraded"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="auth-field-group">
                      <label htmlFor="reg-username-input">New username</label>
                      <input
                        id="reg-username-input"
                        className="auth-input-upgraded"
                        name="username"
                        autoComplete="username"
                        required
                      />
                    </div>
                    <div className="auth-field-group">
                      <label htmlFor="reg-password-input">New password</label>
                      <input
                        id="reg-password-input"
                        className="auth-input-upgraded"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        required
                      />
                    </div>
                  </>
                )}

                {authError && <p className="auth-alert-box">{authError}</p>}
                {registerSuccess && <p className="auth-success-box">{registerSuccess}</p>}

                <button type="submit" className="auth-btn-primary" disabled={loading}>
                  {submitLabel}
                </button>

                <button type="button" className="auth-btn-secondary" onClick={changeAuthMode}>
                  {authMode === 'login' ? 'Create account' : 'Back to sign in'}
                </button>
              </form>
            </section>
          </div>

        </div>
      </div>
    </main>
  )
}

export { AuthScreen }
