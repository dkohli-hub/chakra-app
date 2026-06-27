import { useState } from 'react'
import { T } from '../../utils/theme'
import {
  ACCOUNTS, getToken, requestToken, buildEvent, writeEvent,
  validateSlot, getDomainHint,
} from '../../services/googleCalendar'

export default function ScheduleConfirmModal({ task, onDone, onCancel }) {
  // phases: ask | pick-slot | validating | validation-warning | astro-confirm | writing | success | error
  const [phase, setPhase]         = useState('ask')
  const [date, setDate]           = useState('')
  const [time, setTime]           = useState('')
  const [errorMsg, setErrorMsg]   = useState('')
  const [warnings, setWarnings]   = useState([])
  const [currentWarn, setCurrentWarn] = useState(0)
  const [astro, setAstro]         = useState(null)
  const [itcBlock, setItcBlock]   = useState(null)

  const account   = ACCOUNTS.DK_PERSONAL
  const domainInfo = getDomainHint(task)
  const today     = new Date().toISOString().split('T')[0]

  // Check ITC inline when time changes
  function checkItcInline(dateVal, timeVal) {
    if (!dateVal || !timeVal) { setItcBlock(null); return }
    const dt  = new Date(`${dateVal}T${timeVal}:00`)
    const dow = dt.getDay()
    const h   = dt.getHours()
    if (dow >= 1 && dow <= 5 && h >= 8 && h < 17) {
      setItcBlock('ITC hours (8 AM–5 PM Mon–Fri) are blocked. Pick a time after 5 PM or before 8 AM.')
    } else {
      setItcBlock(null)
    }
  }

  function handleDateChange(v) {
    setDate(v)
    checkItcInline(v, time)
  }

  function handleTimeChange(v) {
    setTime(v)
    checkItcInline(date, v)
  }

  async function handleValidate() {
    if (!date || !time || itcBlock) return
    setPhase('validating')
    try {
      const result = await validateSlot(`${date}T${time}:00`, task)
      if (result.hardBlock) {
        // shouldn't reach here (blocked inline) but safety net
        setWarnings([{ type: result.hardBlock.type, message: result.hardBlock.message, suggestion: result.hardBlock.suggestion }])
        setCurrentWarn(0)
        setPhase('validation-warning')
        return
      }
      setAstro(result.astro)
      if (result.warnings.length > 0) {
        setWarnings(result.warnings)
        setCurrentWarn(0)
        setPhase('validation-warning')
      } else {
        setPhase('astro-confirm')
      }
    } catch {
      setPhase('astro-confirm') // if validation fails, proceed without blocking
    }
  }

  function handleWarnProceed() {
    const next = currentWarn + 1
    if (next < warnings.length) {
      setCurrentWarn(next)
    } else {
      setPhase('astro-confirm')
    }
  }

  function handleWarnPickAnother() {
    setWarnings([])
    setCurrentWarn(0)
    setPhase('pick-slot')
  }

  async function handleConfirm() {
    setPhase('writing')
    try {
      let token = getToken(account.key)
      if (!token) token = await requestToken(account)
      const event = buildEvent(task, `${date}T${time}:00`, astro?.note)
      await writeEvent(token, account.calendarId, event)
      setPhase('success')
      setTimeout(() => onDone(), 2000)
    } catch (err) {
      setErrorMsg(err.message || 'Could not write to Google Calendar')
      setPhase('error')
    }
  }

  // Astro verdict color
  const verdictColor = astro?.verdict === '✅' ? T.teal : astro?.verdict === '⚠️' ? T.red : T.gold

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{
        background: T.surface,
        borderRadius: '16px 16px 0 0',
        width: '100%', maxWidth: '480px',
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)', border: `1px solid ${T.border}`,
        animation: 'fadeSlideIn 0.2s ease',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>

        {/* Header */}
        <div style={{ padding: '0.85rem 1.1rem', borderBottom: `1px solid ${T.border}`, background: T.tealBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: T.teal, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>📅 Google Calendar</div>
          {['ask','pick-slot','validation-warning','astro-confirm','error'].includes(phase) && (
            <button onClick={onCancel} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
          )}
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>

          {/* Task chip */}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={e => handleDateChange(e.target.value)}
                    style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => handleTimeChange(e.target.value)}
                    style={{ width: '100%', background: T.surface2, border: `1px solid ${itcBlock ? T.red : T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* ITC inline error */}
              {itcBlock && (
                <div style={{ background: '#fff1f1', border: `1px solid ${T.red}40`, borderRadius: '8px', padding: '8px 10px', marginBottom: '10px', fontSize: '11px', color: T.red, lineHeight: 1.5 }}>
                  ⛔ {itcBlock}
                </div>
              )}

              {/* Domain hint */}
              {!itcBlock && (
                <div style={{ background: T.tealBg, border: `1px solid ${T.teal}30`, borderRadius: '8px', padding: '7px 10px', marginBottom: '12px', fontSize: '11px', color: T.teal }}>
                  💡 {domainInfo.hint}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPhase('ask')} style={{ flex: 1, padding: '11px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '9px', color: T.text2, fontSize: '13px', cursor: 'pointer' }}>
                  ← Back
                </button>
                <button
                  onClick={handleValidate}
                  disabled={!date || !time || !!itcBlock}
                  style={{ flex: 2, padding: '11px', background: T.teal, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: date && time && !itcBlock ? 'pointer' : 'not-allowed', opacity: date && time && !itcBlock ? 1 : 0.5 }}
                >
                  Check Slot →
                </button>
              </div>
            </>
          )}

          {/* ── Validating ── */}
          {phase === 'validating' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</div>
              <div style={{ color: T.text, fontSize: '14px', fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>Checking slot…</div>
              <div style={{ color: T.textMuted, fontSize: '11px', marginTop: '5px' }}>Spine · Domain · Rahu Kalam</div>
            </div>
          )}

          {/* ── Validation warning ── */}
          {phase === 'validation-warning' && warnings[currentWarn] && (
            <>
              <div style={{ background: '#fff8e6', border: `1px solid ${T.gold}50`, borderRadius: '10px', padding: '12px 14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: T.text, marginBottom: '5px', lineHeight: 1.4 }}>
                  {warnings[currentWarn].message}
                </div>
                <div style={{ fontSize: '11px', color: T.text2, lineHeight: 1.5 }}>
                  {warnings[currentWarn].suggestion}
                </div>
              </div>
              {warnings.length > 1 && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: T.textMuted, marginBottom: '10px' }}>
                  {currentWarn + 1} of {warnings.length} notices
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleWarnPickAnother} style={{ flex: 1, padding: '11px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '9px', color: T.text2, fontSize: '12px', cursor: 'pointer' }}>
                  Pick Another
                </button>
                <button onClick={handleWarnProceed} style={{ flex: 2, padding: '11px', background: T.teal, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  Proceed Anyway →
                </button>
              </div>
            </>
          )}

          {/* ── Astro confirm ── */}
          {phase === 'astro-confirm' && astro && (
            <>
              {/* Astro badge */}
              <div style={{ background: T.surface2, border: `1px solid ${verdictColor}40`, borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{astro.verdict}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: verdictColor, marginBottom: '3px' }}>
                  {astro.verdict === '✅' ? 'Auspicious' : astro.verdict === '⚠️' ? 'Unfavorable' : 'Neutral'}
                </div>
                <div style={{ fontSize: '11px', color: T.text2, lineHeight: 1.4 }}>{astro.note}</div>
              </div>

              {/* Slot summary */}
              <div style={{ fontSize: '11px', color: T.textMuted, textAlign: 'center', marginBottom: '16px' }}>
                {new Date(`${date}T${time}:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                {' · '}
                {new Date(`${date}T${time}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                {' · dh.kohli@gmail.com'}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPhase('pick-slot')} style={{ flex: 1, padding: '11px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '9px', color: T.text2, fontSize: '12px', cursor: 'pointer' }}>
                  ← Change
                </button>
                <button onClick={handleConfirm} style={{ flex: 2, padding: '11px', background: T.teal, border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
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
