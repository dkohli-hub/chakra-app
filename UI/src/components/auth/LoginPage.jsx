import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const DEV_USERS = [
  { username: 'dk',      password: 'dk@chakra',      role: 'admin' },
  { username: 'tester1', password: 'tester1@chakra', role: 'tester' },
  { username: 'tester2', password: 'tester2@chakra', role: 'tester' },
  { username: 'tester3', password: 'tester3@chakra', role: 'tester' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch {
      setError('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background radial glow */}
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img
            src="/chakra-logo.png"
            alt="Chakra™"
            style={styles.logo}
          />
        </div>

        {/* Tagline — character-by-character slide in from left */}
        <div style={styles.tagline}>
          <p style={styles.tagSub}>
            {'Karma Kshetra™ — The Field of Action'.split('').map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: 0,
                  animation: 'charSlideIn 0.4s ease forwards',
                  animationDelay: `${i * 0.035}s`,
                  whiteSpace: ch === ' ' ? 'pre' : 'normal',
                }}
              >
                {ch}
              </span>
            ))}
          </p>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText} className="om-spin">ॐ</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>👤</span>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              required
              autoComplete="username"
              style={styles.input}
            />
          </div>
          <div style={{ ...styles.inputWrap, marginTop: '0.75rem' }}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Entering...' : 'Enter Karma Kshetra™'}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          a SUTRA system by DK · House of DK · Aux Services LLC
        </p>

        {/* DEV ONLY panel — remove before go-live */}
        <div style={styles.devPanel}>
          <p style={styles.devTitle}>Dev credentials</p>
          {DEV_USERS.map(u => (
            <button
              key={u.username}
              onClick={() => { setUsername(u.username); setPassword(u.password) }}
              style={styles.devRow}
            >
              <span style={styles.devUser}>{u.username}</span>
              <span style={styles.devPass}>{u.password}</span>
              {u.role === 'admin' && <span style={styles.devBadge}>admin</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#061A0F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: '0.5rem',
  },
  logo: {
    width: '200px',
    height: '200px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.35))',
  },
  tagline: {
    textAlign: 'center',
    marginBottom: '1.25rem',
  },
  tagSub: {
    color: '#8b7a4a',
    fontSize: '12px',
    letterSpacing: '0.08em',
    margin: 0,
    fontStyle: 'italic',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    marginBottom: '1.5rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(to right, transparent, #C9A84C40, transparent)',
  },
  dividerText: {
    color: '#C9A84C',
    fontSize: '16px',
    opacity: 0.6,
  },
  form: {
    width: '100%',
    background: 'rgba(26,107,90,0.06)',
    border: '1px solid rgba(201,168,76,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    marginBottom: '1rem',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(201,168,76,0.25)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  inputIcon: {
    padding: '0 0.75rem',
    fontSize: '14px',
    opacity: 0.5,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e6edf3',
    fontSize: '14px',
    padding: '0.7rem 0.75rem 0.7rem 0',
    fontFamily: 'system-ui, sans-serif',
  },
  errorBox: {
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(183,28,28,0.15)',
    border: '1px solid rgba(183,28,28,0.4)',
    borderRadius: '6px',
    color: '#ef9a9a',
    fontSize: '12px',
  },
  btn: {
    width: '100%',
    marginTop: '1.25rem',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #1A6B5A, #0D4A3A)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '8px',
    color: '#C9A84C',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'opacity 0.2s',
  },
  footer: {
    color: '#3a5a48',
    fontSize: '10px',
    letterSpacing: '0.06em',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  devPanel: {
    width: '100%',
    background: 'rgba(255,255,255,0.02)',
    border: '1px dashed #21262D',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
  },
  devTitle: {
    color: '#3a4a40',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0',
  },
  devRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '3px 0',
    textAlign: 'left',
  },
  devUser: {
    color: '#C9A84C',
    fontSize: '12px',
    minWidth: '64px',
    fontWeight: 600,
  },
  devPass: {
    color: '#3a5a48',
    fontSize: '12px',
    flex: 1,
  },
  devBadge: {
    fontSize: '10px',
    color: '#00BFA5',
    border: '1px solid #00BFA5',
    borderRadius: '3px',
    padding: '0 4px',
  },
}
