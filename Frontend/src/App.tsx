import { useState, type FormEvent } from 'react'
import './App.css'
import heroMark from './assets/hero.png'
import { backendApi } from './api/backendApi'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import type { AuthMode, Session } from './models/resourceConfig'

const SESSION_KEY = 'psk-session'

const credentialsFrom = (form: HTMLFormElement) => {
  const formData = new FormData(form)
  const username = formData.get('username')
  const password = formData.get('password')

  return {
    username: typeof username === 'string' ? username : '',
    password: typeof password === 'string' ? password : '',
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(() => JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'))
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const submitAuth = async (event: FormEvent<HTMLFormElement>, mode: AuthMode) => {
    event.preventDefault()
    setAuthError('')
    if (mode === 'register') setRegisterSuccess('')
    setLoading(true)

    try {
      const credentials = credentialsFrom(event.currentTarget)
      if (mode === 'login') {
        const result = await backendApi.login(credentials)
        localStorage.setItem(SESSION_KEY, JSON.stringify(result))
        setSession(result)
      } else {
        const result = await backendApi.register(credentials)
        setRegisterSuccess(`Registered ${result.username}. You can sign in now.`)
        setAuthMode('login')
      }
    } catch (error) {
      const fallbackMessage = mode === 'login' ? 'Unable to sign in.' : 'Unable to register user.'
      setAuthError(error instanceof Error ? error.message : fallbackMessage)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  if (!session) {
    return (
      <AuthScreen
        actions={{
          changeAuthMode: () => {
            setAuthError('')
            setRegisterSuccess('')
            setAuthMode((mode) => (mode === 'login' ? 'register' : 'login'))
          },
          register: (event) => submitAuth(event, 'register'),
          signIn: (event) => submitAuth(event, 'login'),
        }}
        heroMark={heroMark}
        state={{ authError, authMode, loading, registerSuccess }}
      />
    )
  }

  return <Dashboard session={session} onSignOut={signOut} />
}

export default App
