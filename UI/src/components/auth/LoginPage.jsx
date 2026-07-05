import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { T } from '../../utils/theme'


export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

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
      <div style={styles.container}>
        <div style={styles.logoWrap}>
          <img src="/chakra-logo.png" alt="Chakra™" style={styles.logo} />
        </div>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 700, color: T.forest, letterSpacing: '4px', marginBottom: '4px' }}>
          CHAKRA
        </div>
        <div style={{ fontSize: '9px', color: T.goldText, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
          YOUR MIND, STRUCTURED.
        </div>

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

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText} className="om-spin">ॐ</span>
          <div style={styles.dividerLine} />
        </div>

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

          {error && <div style={styles.errorBox}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Entering...' : 'Enter Karma Kshetra™'}
          </button>
        </form>

        <p style={styles.footer}>a SUTRA system by DK · House of DK · Aux Services LLC</p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100dvh',
    background: T.pageBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'max(1rem, env(safe-area-inset-top, 1rem)) 1rem max(1rem, env(safe-area-inset-bottom, 1rem))',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoWrap:   { marginBottom: '0.5rem' },
  logo:       { width: '160px', height: '160px', maxWidth: '50vw', maxHeight: '50vw', objectFit: 'contain', filter: `drop-shadow(0 0 24px ${T.gold}55)` },
  tagline:    { textAlign: 'center', marginBottom: '1.25rem' },
  tagSub:     { color: T.goldText, fontSize: '12px', letterSpacing: '0.08em', margin: 0, fontStyle: 'italic' },
  divider:    { display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', marginBottom: '1.5rem' },
  dividerLine:{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${T.gold}60, transparent)` },
  dividerText:{ color: T.gold, fontSize: '16px', opacity: 0.7 },
  form: {
    width: '100%',
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: '14px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '1rem',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: T.surface2,
    border: `1px solid ${T.border}`,
    borderRadius: '8px',
    overflow: 'hidden',
  },
  inputIcon:  { padding: '0 0.75rem', fontSize: '14px', opacity: 0.5 },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: T.text,
    fontSize: '16px',
    padding: '0.7rem 0.75rem 0.7rem 0',
    fontFamily: "'Montserrat', system-ui, sans-serif",
  },
  errorBox: {
    marginTop: '0.75rem',
    padding: '0.5rem 0.75rem',
    background: T.redBg,
    border: `1px solid ${T.red}40`,
    borderRadius: '6px',
    color: T.red,
    fontSize: '12px',
  },
  btn: {
    width: '100%',
    marginTop: '1.25rem',
    padding: '0.75rem',
    background: T.teal,
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    fontFamily: "'Montserrat', system-ui, sans-serif",
  },
  footer:   { color: T.textMuted, fontSize: '10px', letterSpacing: '0.06em', textAlign: 'center', marginBottom: '1.5rem' },
}
