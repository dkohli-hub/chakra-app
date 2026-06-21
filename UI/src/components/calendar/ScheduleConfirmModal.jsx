import { useEffect, useState } from 'react'
import { T } from '../../utils/theme'
import {
  ACCOUNTS, getToken, requestToken,
  validateSlot, determineAccount, buildEvent, writeEvent,
} from '../../services/googleCalendar'

export default function ScheduleConfirmModal({ task, dateTimeISO, onConfirm, onCancel }) {
  const [phase, setPhase]       = useState('validating') // validating|confirm|auth-needed|writing|success|error
  const [validation, setValidation] = useState(null)
  const [account, setAccount]   = useState(null)
  const [authAccount, setAuthAccount] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const [v, a] = await Promise.all([validateSlot(dateTimeISO), determineAccount(task)])
        if (!cancelled) { setValidation(v); setAccount(a); setPhase('confirm') }
      } catch (err) {
        if (!cancelled) { setErrorMsg(err.message || 'Validation failed'); setPhase('error') }
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  async function handleYes() {
    const token = getToken(account.key)
    if (!token) { setAuthAccount(account); setPhase('auth-needed'); return }
    await scheduleNow(token)
  }

  async function handleAuth() {
    setPhase('writing')
    try {
      const token = await requestToken(authAccount)
      await scheduleNow(token)
    } catch (err) {
      setErrorMsg(err.message || 'Google sign-in failed or was cancelled')
      setPhase('error')
    }
  }

  async function scheduleNow(token) {
    setPhase('writing')
    try {
      const event = buildEvent(task, dateTimeISO)
      await writeEvent(token, account.calendarId, event)
      setPhase('success')
      setTimeout(() => onConfirm(), 2200)
    } catch (err) {
      setErrorMsg(err.message || 'Could not create calendar event')
      setPhase('error')
    }
  }

  const flagBg = (type) => {
    if (type === 'warning')   return { bg: T.amberBg,  border: T.amber + '40'  }
    if (type === 'sacred')    return { bg: T.tealBg,   border: T.teal  + '40'  }
    if (type === 'protected') return { bg: T.surface2, border: T.border        }
    return                           { bg: T.surface2, border: T.border        }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={e => { if (e.target === e.currentTarget && phase === 'confirm') onCancel() }}>
      <div style={{
        background: T.surface, borderRadius: '16px', width: '100%', maxWidth: '440px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)', border: `1px solid ${T.border}`,
        overflow: 'hidden', animation: 'fadeSlideIn 0.22s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: `1px solid ${T.border}`, background: T.tealBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: T.teal, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>📅 Chakra™ Scheduling</div>
            <div style={{ color: T.text, fontSize: '17px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, marginTop: '2px' }}>Schedule to Calendar</div>
          </div>
          {(phase === 'confirm' || phase === 'auth-needed' || phase === 'error') && (
            <button onClick={onCancel} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
          )}
        </div>

        <div style={{ padding: '1.1rem 1.25rem' }}>

          {/* Task chip */}
          {task && (
            <div style={{ background: T.surface2, borderRadius: '8px', padding: '7px 12px', marginBottom: '12px', border: `1px solid ${T.border}` }}>
              <div style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Task</div>
              <div style={{ color: T.text, fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{task.title}</div>
            </div>
          )}

          {/* ── Validating ── */}
          {phase === 'validating' && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: T.textMuted }}>
              <div style={{ fontSize: '28px', marginBottom: '10px', color: T.teal }}>✦</div>
              <div style={{ fontSize: '13px' }}>Checking rulebook &amp; astrological data…</div>
              <div style={{ fontSize: '11px', marginTop: '4px', color: T.textMuted }}>Austin · America/Chicago</div>
            </div>
          )}

          {/* ── Confirm ── */}
          {phase === 'confirm' && validation && account && (
            <>
              {/* Slot + Calendar row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: T.surface2, borderRadius: '8px', padding: '8px 10px', border: `1px solid ${T.border}` }}>
                  <div style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Slot</div>
                  <div style={{ color: T.goldText, fontSize: '11px', fontWeight: 600, marginTop: '3px', lineHeight: 1.4 }}>{validation.slotLabel}</div>
                </div>
                <div style={{ background: T.surface2, borderRadius: '8px', padding: '8px 10px', border: `1px solid ${T.teal}50` }}>
                  <div style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Calendar</div>
                  <div style={{ color: T.teal, fontSize: '12px', fontWeight: 700, marginTop: '3px' }}>{account.icon} {account.label}</div>
                  <div style={{ color: T.textMuted, fontSize: '9px', marginTop: '1px' }}>{account.email}</div>
                </div>
              </div>

              {/* Rulebook flags */}
              {validation.flags.length > 0 ? (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: T.goldText, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Rulebook Flags</div>
                  {validation.flags.map((f, i) => {
                    const style = flagBg(f.type)
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '8px',
                        padding: '7px 10px', borderRadius: '7px', marginBottom: '4px',
                        background: style.bg, border: `1px solid ${style.border}`,
                      }}>
                        <span style={{ fontSize: '13px', flexShrink: 0, lineHeight: 1.5 }}>{f.emoji}</span>
                        <span style={{ color: T.text2, fontSize: '11px', lineHeight: 1.5 }}>{f.message}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: '#1A6B5A12', border: `1px solid ${T.teal}35`, marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px' }}>✅</span>
                  <span style={{ color: T.teal, fontSize: '12px', fontWeight: 500 }}>Slot is clear — no rulebook conflicts</span>
                </div>
              )}

              <div style={{ color: T.text2, fontSize: '12px', textAlign: 'center', marginBottom: '14px', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '14px' }}>
                This slot is available. Schedule it now?
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '11px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '9px', color: T.text2, fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                  No, go back
                </button>
                <button onClick={handleYes} style={{ flex: 2, padding: '11px', background: T.teal, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.02em' }}>
                  Yes, schedule it →
                </button>
              </div>
            </>
          )}

          {/* ── Auth needed ── */}
          {phase === 'auth-needed' && authAccount && (
            <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔐</div>
              <div style={{ color: T.text, fontSize: '15px', fontWeight: 700, marginBottom: '6px', fontFamily: "'Cormorant Garamond', serif" }}>Connect Google Account</div>
              <div style={{ color: T.text2, fontSize: '12px', lineHeight: 1.6, marginBottom: '18px' }}>
                Sign in with <strong style={{ color: T.goldText }}>{authAccount.email}</strong> to write to the <strong style={{ color: T.teal }}>{authAccount.label}</strong> calendar.
              </div>
              <button onClick={handleAuth} style={{ padding: '11px 28px', background: T.teal, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 700, marginBottom: '8px', display: 'block', width: '100%' }}>
                Sign in with Google
              </button>
              <button onClick={onCancel} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '11px', cursor: 'pointer', padding: '4px' }}>
                Cancel
              </button>
            </div>
          )}

          {/* ── Writing ── */}
          {phase === 'writing' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
              <div style={{ color: T.text, fontSize: '15px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>Going to Calendar…</div>
              <div style={{ color: T.textMuted, fontSize: '11px', marginTop: '6px' }}>Adding to {account?.label} ({account?.email})</div>
            </div>
          )}

          {/* ── Success ── */}
          {phase === 'success' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <div style={{ color: T.teal, fontSize: '16px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>Scheduled!</div>
              <div style={{ color: T.text2, fontSize: '12px', marginTop: '8px', lineHeight: 1.5 }}>
                Added to <strong>{account?.label}</strong><br />
                <span style={{ color: T.textMuted }}>{account?.email}</span>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {phase === 'error' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
              <div style={{ color: T.red, fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Failed to schedule</div>
              <div style={{ color: T.text2, fontSize: '11px', marginBottom: '16px', lineHeight: 1.5 }}>{errorMsg}</div>
              <button onClick={onCancel} style={{ padding: '9px 20px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text2, fontSize: '12px', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
