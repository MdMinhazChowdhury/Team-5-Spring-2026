import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

const s = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3efe8',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 40,
    width: 400,
    boxShadow: '0 4px 32px rgba(14,28,79,0.10)',
  },
  brand: {
    fontSize: 26,
    fontWeight: 700,
    fontStyle: 'italic',
    color: '#0e1c4f',
    marginBottom: 8,
    textAlign: 'center',
  },
  brandAccent: { color: '#336659' },
  subtitle: {
    fontSize: 14,
    color: '#bba591',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#0e1c4f',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #bba591',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    marginBottom: 20,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: '#fdf9f4',
    color: '#0e1c4f',
  },
  nameRow: {
    display: 'flex',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#336659',
    color: '#f3efe8',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    marginBottom: 16,
  },
  toggleRow: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#bba591',
  },
  toggleLink: {
    color: '#336659',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontSize: 14,
    padding: 0,
    marginLeft: 4,
    fontFamily: 'inherit',
  },
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function switchMode(next) {
    setMode(next)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const data = await authApi.login(email, password)
        localStorage.setItem('token', data.access_token)
      } else {
        const data = await authApi.signup(firstName, lastName, email, password)
        localStorage.setItem('token', data.access_token)
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || (mode === 'login' ? 'Login failed' : 'Signup failed'))
    } finally {
      setLoading(false)
    }
  }

  const isSignup = mode === 'signup'

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          Finance<span style={s.brandAccent}>Tracker</span>
        </div>
        <div style={s.subtitle}>{isSignup ? 'Create your account' : 'Sign in to your account'}</div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={s.nameRow}>
              <div style={s.nameField}>
                <label style={s.label}>First Name</label>
                <input
                  style={s.input}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  required
                  autoFocus
                />
              </div>
              <div style={s.nameField}>
                <label style={s.label}>Last Name</label>
                <input
                  style={s.input}
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                />
              </div>
            </div>
          )}

          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus={!isSignup}
          />

          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button style={s.button} type="submit" disabled={loading}>
            {loading ? (isSignup ? 'Creating account…' : 'Signing in…') : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={s.toggleRow}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button style={s.toggleLink} onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
