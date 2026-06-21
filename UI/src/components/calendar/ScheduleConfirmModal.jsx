import { useState } from 'react'
import { T } from '../../utils/theme'
import { ACCOUNTS, getToken, requestToken, buildEvent, writeEvent } from '../../services/googleCalendar'

export default function ScheduleConfirmModal({ task, onDone, onCancel }) {
  const [phase, setPhase]       = useState('ask')      // ask | pick-slot | writing | success | error
  const [date, setDate]         = useState('')
  const [time, setTime]         = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const account = ACCOUNTS.DK_PERSONAL

  async function handleConfirm() {
    if (!date || !time) return
    setPhase('writing')
    try {
      let token = getToken(account.key)
      if (!token) token = await requestToken(account)
      const event = buildEvent(task, `${date}T${time}:00`)
      await writeEvent(token, account.calendarId, event)
      setPhase('success')
      setTimeout(() => onDone(), 2000)
    } catch (err) {
      setErrorMsg(err.message || 'Could not write to Google Calendar')
      setPhase('error')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: T.surface, borderRadius: '16px', width: '100%', maxWidth: '380px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `1px solid ${T.border}`,
        overflow: 'hidden', animation: 'fadeSlideIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '0.85rem 1.1rem', borderBottom: `1px solid ${T.border}`, background: T.tealBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: T.teal, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>📅 Google Calendar</div>
          {(phase === 'ask' || phase === 'pick-slot' || phase === 'error') && (
            <button onClick={onCancel} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
          )}
        </div>

        <div style={{ padding: '1.25rem' }}>

          {/* Task title chip */}
          <div style={{ background: T.surface2, borderRadius: '8px', padding: '7px 12px', marginBottom: '14px', border: `1px solid ${T.border}` }}>
            <div style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Task</div>
            <div style={{ color: T.text, fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{task?.title}</div>
          </div>

          {/* ── Ask ── */}
          {phase === 'ask' && (
            <>
              <div style={{ color: T.text, fontSize: '15px', fontWeight: 600, textAlign: 'center', marginBottom: '6px', fontFamily: "'Cormorant Garamond', serif" }}>
                Want to add this to Google Calendar?
              </div>
              <div style={{ color: T.textMuted, fontSize: '11px', textAlign: 'center', marginBottom: '20px' }}>
                Will be added to <strong style={{ color: T.goldText }}>dh.kohli@gmail.com</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '11px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '9px', color: T.text2, fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                  No
                </button>
                <button onClick={() => setPhase('pick-slot')} style={{ flex: 2, padding: '11px', background: T.teal, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 700 }}>
                  Yes →
                </button>
              </div>
            </>
          )}

          {/* ── Pick slot ── */}
          {phase === 'pick-slot' && (
            <>
              <div style={{ color: T.text, fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Select a time slot</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={e => setDate(e.target.value)}
                    style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPhase('ask')} style={{ flex: 1, padding: '11px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '9px', color: T.text2, fontSize: '13px', cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!date || !time}
                  style={{ flex: 2, padding: '11px', background: T.teal, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', cursor: date && time ? 'pointer' : 'not-allowed', fontWeight: 700, opacity: date && time ? 1 : 0.5 }}
                >
                  Confirm →
                </button>
              </div>
            </>
          )}

          {/* ── Writing ── */}
          {phase === 'writing' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '34px', marginBottom: '12px' }}>📅</div>
              <div style={{ color: T.text, fontSize: '15px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>Going to your Calendar…</div>
              <div style={{ color: T.textMuted, fontSize: '11px', marginTop: '6px' }}>Adding to dh.kohli@gmail.com</div>
            </div>
          )}

          {/* ── Success ── */}
          {phase === 'success' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '38px', marginBottom: '12px' }}>✅</div>
              <div style={{ color: T.teal, fontSize: '16px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>Added to Calendar!</div>
              <div style={{ color: T.textMuted, fontSize: '11px', marginTop: '6px' }}>dh.kohli@gmail.com</div>
            </div>
          )}

          {/* ── Error ── */}
          {phase === 'error' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
              <div style={{ color: T.red, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Failed to add</div>
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
