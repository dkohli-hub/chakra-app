import { useEffect, useRef, useState } from 'react'
import { T } from '../../utils/theme'
import { ACCOUNTS, getToken, clearToken } from '../../services/googleCalendar'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES    = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export default function CalendarModal({ onClose }) {
  const [status, setStatus]     = useState('idle')   // idle | loading | authed | error | no-key
  const [events, setEvents]     = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const tokenClientRef = useRef(null)

  useEffect(() => {
    if (!CLIENT_ID) { setStatus('no-key'); return }
  }, [])

  async function handleConnect() {
    if (!CLIENT_ID) { setStatus('no-key'); return }
    setStatus('loading')
    try {
      await loadGsiScript()
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setErrorMsg(tokenResponse.error)
            setStatus('error')
            return
          }
          await fetchEvents(tokenResponse.access_token)
        },
      })
      tokenClientRef.current.requestAccessToken()
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to load Google Sign-In')
      setStatus('error')
    }
  }

  async function fetchEvents(accessToken) {
    try {
      const now     = new Date().toISOString()
      const in7days = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${in7days}&singleEvents=true&orderBy=startTime&maxResults=20`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
      if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)
      const data = await res.json()
      setEvents(data.items || [])
      setStatus('authed')
    } catch (err) {
      setErrorMsg(err?.message || 'Could not fetch calendar events')
      setStatus('error')
    }
  }

  function formatTime(evt) {
    const start = evt.start?.dateTime || evt.start?.date
    if (!start) return ''
    const d = new Date(start)
    if (evt.start?.date) return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: T.surface, borderRadius: '16px', width: '100%', maxWidth: '480px',
        maxHeight: '80dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: `1px solid ${T.border}`,
      }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: T.goldText, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Kriya™</div>
            <div style={{ color: T.text, fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>Calendar View</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>

          {status === 'no-key' && (
            <div style={{ background: T.amberBg, border: `1px solid ${T.amber}30`, borderRadius: '10px', padding: '1rem' }}>
              <div style={{ color: T.amber, fontWeight: 700, fontSize: '12px', marginBottom: '8px' }}>Google Client ID not configured</div>
              <p style={{ color: T.text2, fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                To enable Calendar integration, follow these steps:
              </p>
              <ol style={{ color: T.text2, fontSize: '12px', lineHeight: 2, paddingLeft: '1.25rem', marginTop: '8px' }}>
                <li>Go to <strong>console.cloud.google.com</strong></li>
                <li>Create a new project (or select existing)</li>
                <li>Enable <strong>Google Calendar API</strong></li>
                <li>Go to <strong>Credentials → Create OAuth 2.0 Client ID</strong> (Web application)</li>
                <li>Add authorized JS origins:<br />
                  <code style={{ background: T.surface2, padding: '1px 6px', borderRadius: '4px', fontSize: '11px', overflowWrap: 'anywhere', wordBreak: 'break-all' }}>http://localhost:5173</code><br />
                  <code style={{ background: T.surface2, padding: '1px 6px', borderRadius: '4px', fontSize: '11px', overflowWrap: 'anywhere', wordBreak: 'break-all' }}>https://your-render-app.onrender.com</code>
                </li>
                <li>Copy the <strong>Client ID</strong></li>
                <li>Add to <code style={{ background: T.surface2, padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>UI/.env</code>:<br />
                  <code style={{ background: T.surface2, padding: '1px 6px', borderRadius: '4px', fontSize: '11px', overflowWrap: 'anywhere', wordBreak: 'break-all' }}>VITE_GOOGLE_CLIENT_ID=your-client-id</code>
                </li>
                <li>Restart dev server / redeploy</li>
              </ol>
            </div>
          )}

          {status === 'idle' && (
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
              <p style={{ color: T.text2, fontSize: '13px', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Connect Google Calendar to see your upcoming events alongside your Karma Kshetra™ tasks.
              </p>
              <button onClick={handleConnect} style={{
                padding: '10px 24px', background: T.teal, color: '#fff',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '13px',
              }}>
                Connect Google Calendar
              </button>
            </div>
          )}

          {status === 'loading' && (
            <p style={{ color: T.textMuted, textAlign: 'center', fontStyle: 'italic' }}>Connecting…</p>
          )}

          {status === 'error' && (
            <div style={{ background: T.redBg, border: `1px solid ${T.red}30`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: T.red, fontWeight: 700, fontSize: '12px' }}>Connection error</div>
              <div style={{ color: T.text2, fontSize: '12px', marginTop: '4px' }}>{errorMsg}</div>
              <button onClick={() => setStatus('idle')} style={{ marginTop: '8px', background: 'none', border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text2, fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}>
                Try again
              </button>
            </div>
          )}

          {/* Connected accounts status — always visible when key present */}
          {status !== 'no-key' && (
            <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' }}>
              <div style={{ color: T.goldText, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Calendar Connections</div>
              {Object.values(ACCOUNTS).map(acc => {
                const connected = !!getToken(acc.key)
                return (
                  <div key={acc.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{acc.icon}</span>
                      <div>
                        <div style={{ color: T.text, fontSize: '11px', fontWeight: 600 }}>{acc.label}</div>
                        <div style={{ color: T.textMuted, fontSize: '9px' }}>{acc.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: connected ? T.teal : T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {connected ? '● Active' : '○ Not connected'}
                      </span>
                      {connected && (
                        <button
                          onClick={() => { clearToken(acc.key); setStatus(s => s) }}
                          style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: '4px', color: T.textMuted, fontSize: '9px', padding: '2px 6px', cursor: 'pointer' }}
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              <div style={{ color: T.textMuted, fontSize: '9px', marginTop: '6px', fontStyle: 'italic' }}>
                Connections are established when you first schedule a task to each calendar.
              </div>
            </div>
          )}

          {status === 'authed' && (
            <>
              <div style={{ color: T.goldText, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Next 7 days
              </div>
              {events.length === 0 ? (
                <p style={{ color: T.textMuted, fontSize: '13px', fontStyle: 'italic' }}>No upcoming events found.</p>
              ) : (
                events.map(evt => (
                  <div key={evt.id} style={{
                    background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px',
                    padding: '0.6rem 0.85rem', marginBottom: '6px',
                    borderLeft: `3px solid ${T.teal}`,
                  }}>
                    <div style={{ color: T.text, fontSize: '13px', fontWeight: 500 }}>{evt.summary || '(No title)'}</div>
                    <div style={{ color: T.textMuted, fontSize: '10px', marginTop: '2px' }}>{formatTime(evt)}</div>
                    {evt.location && <div style={{ color: T.textMuted, fontSize: '10px' }}>📍 {evt.location}</div>}
                  </div>
                ))
              )}
              <button onClick={() => { setStatus('idle'); setEvents([]) }} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '10px', cursor: 'pointer', marginTop: '8px', padding: 0 }}>
                Disconnect from event view
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
