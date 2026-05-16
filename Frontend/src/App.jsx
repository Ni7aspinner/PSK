import { useState } from 'react'
import './App.css'
import heroMark from './assets/hero.png'
import { backendApi } from './api/backendApi'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'

const SESSION_KEY = 'psk-session'
const credentialsFrom = (form) => Object.fromEntries(new FormData(form).entries())

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null'))
  const [authMode, setAuthMode] = useState('login')
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(false)

  const submitAuth = async (event, mode) => {
    event.preventDefault()
    setAuthError('')
    if (mode === 'register') setRegisterSuccess('')
    setLoading(true)

    try {
      const result = await backendApi[mode](credentialsFrom(event.currentTarget))
      if (mode === 'login') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(result))
        setSession(result)
      } else {
        setRegisterSuccess(`Registered ${result.username}. You can sign in now.`)
        setAuthMode('login')
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : `Unable to ${mode === 'login' ? 'sign in' : 'register user'}.`)
    } finally {
      setLoading(false)
    }
  }

  const signIn = (event) => submitAuth(event, 'login')
  const register = (event) => submitAuth(event, 'register')

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
          register,
          signIn,
        }}
        heroMark={heroMark}
        state={{ authError, authMode, loading, registerSuccess }}
      />
    )
  }

  return <Dashboard session={session} onSignOut={signOut} />
}

export default App
