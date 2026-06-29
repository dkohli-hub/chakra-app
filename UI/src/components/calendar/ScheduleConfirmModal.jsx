import { useState } from 'react'
import { T } from '../../utils/theme'
import {
  ACCOUNTS, getToken, requestToken, buildEvent, writeEvent,
  validateSlot, getDomainHint,
} from '../../services/googleCalendar'

export default function ScheduleConfirmModal({ task, onDone, onCancel }) {
  // phases: ask | pick-slot | validating | validation-warning | astro-confirm | writing | success | error
  const [phase, setPhase]             = useState('ask')
  const [date, setDate]               = useState('')
  const [time, setTime]               = useState('')
  const [errorMsg, setErrorMsg]       = useState('')
  const [warnings, setWarnings]       = useState([])
  const [currentWarn, setCurrentWarn] = useState(0)
  const [astro, setAstro]             = useState(null)
  const [itcBlock, setItcBlock]       = useState(null)

  const account    = ACCOUNTS.DK_PERSONAL
  const domainInfo = getDomainHint(task)
  const today      = new Date().toISOString().split('T')[0]

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

  function handleDateChange(v) { setDate(v); checkItcInline(v, time) }
  function handleTimeChange(v) { setTime(v); checkItcInline(date, v) }

  async function handleValidate() {
    if (!date || !time || itcBlock) return
    setPhase('validating')
    try {
      const result = await validateSlot(`${date}T${time}:00`, task)
      if (result.hardBlock) {
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
      setPhase('astro-confirm')
    }
  }

  function handleWarnProceed() {
    const next = currentWarn + 1
    if (next < warnings.length) { setCurrentWarn(next) }
    else { setPhase('astro-confirm') }
  }

  function handleWarnPickAnother() {
    setWarnings([]); setCurrentWarn(0); setPhase('pick-slot')
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

  const verdictColor = astro?.verdict === '✅' ? T.teal : astro?.verdict === '⚠️' ? T.red : T.gold

  // ── Button rows per phase (rendered outside scroll area, always visible) ──
  function Buttons() {
    if (phase === 'ask') return (
      <div style={btnRow}>
        <button onClick={onCancel} style={btnSecondary}>No</button>
        <button onClick={() => setPhase('pick-slot')} style={{ ...btnPrimary, flex: 2 }}>Yes →</button>
      </div>
    )
    if (phase === 'pick-slot') return (
      <div style={btnRow}>
        <button onClick={() => setPhase('ask')} style={btnSecondary}>← Back</button>
        <button
          onClick={handleValidate}
          disabled={!date || !time || !!itcBlock}
          style={{ ...btnPrimary, flex: 2, opacity: date && time && !itcBlock ? 1 : 0.5, cursor: date && time && !itcBlock ? 'pointer' : 'not-allowed' }}
        >Check Slot →</button>
      </div>
    )
    if (phase === 'validation-warning') return (
      <div style={btnRow}>
        <button onClick={handleWarnPickAnother} style={btnSecondary}>Pick Another</button>
        <button onClick={handleWarnProceed} style={{ ...btnPrimary, flex: 2 }}>Proceed Anyway →</button>
      </div>
    )
    if (phase === 'astro-confirm') return (
      <div style={btnRow}>
        <button onClick={() => setPhase('pick-slot')} style={btnSecondary}>← Change</button>
        <button onClick={handleConfirm} style={{ ...btnPrimary, flex: 2 }}>Confirm →</button>
      </div>
    )
    if (phase === 'error') return (
      <div style={btnRow}>
        <button onClick={onCancel} style={{ ...btnSecondary, flex: 1 }}>Close</button>
      </div>
    )
    return null
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      zIndex: 1200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      overscrollBehavior: 'contain',
    }}>
      {/* Sheet — anchored to bottom, never floats */}
      <div style={{
        position: 'relative',
        background: T.surface,
        borderRadius: '18px 18px 0 0',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '85dvh',      // dvh = dynamic viewport height (shrinks with keyboard on iOS)
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        border: `1px solid ${T.border}`,
        borderBottom: 'none',
      }}>

        {/* Drag handle */}
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: T.border, margin: '10px auto 0', flexShrink: 0 }} />

        {/* Header — fixed, never scrolls */}
        <div style={{
          padding: '10px 16px 12px',
          borderBottom: `1px solid ${T.border}`,
          background: T.tealBg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
          borderRadius: '18px 18px 0 0',
        }}>
          <div style={{ color: T.teal, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>📅 Google Calendar</div>
          {['ask','pick-slot','validation-warning','astro-confirm','error'].includes(phase) && (
            <button onClick={onCancel} style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px 8px' }}>✕</button>
          )}
        </div>

        {/* Scrollable content — grows, shrinks, never hides buttons */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          padding: '16px 16px 8px',
        }}>

          {/* Task chip */}
          <div style={{ background: T.surface2, borderRadius: '8px', padding: '7px 12px', marginBottom: '14px', border: `1px solid ${T.border}` }}>
            <div style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Task</div>
            <div style={{ color: T.text, fontSize: '13px', fontWeight: 600, marginTop: '2px', wordBreak: 'break-word' }}>{task?.title}</div>
          </div>

          {/* ── Ask ── */}
          {phase === 'ask' && (
            <>
              <div style={{ color: T.text, fontSize: '15px', fontWeight: 600, textAlign: 'center', marginBottom: '6px', fontFamily: "'Cormorant Garamond', serif" }}>
                Want to add this to Google Calendar?
              </div>
              <div style={{ color: T.textMuted, fontSize: '11px', textAlign: 'center', marginBottom: '8px' }}>
                Will be added to <strong style={{ color: T.goldText }}>dh.kohli@gmail.com</strong>
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
                    type="date" value={date} min={today}
                    onChange={e => handleDateChange(e.target.value)}
                    style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', padding: '9px 8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Time</label>
                  <input
                    type="time" value={time}
                    onChange={e => handleTimeChange(e.target.value)}
                    style={{ width: '100%', background: T.surface2, border: `1px solid ${itcBlock ? T.red : T.border}`, borderRadius: '7px', color: T.text, fontSize: '13px', padding: '9px 8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              {itcBlock && (
                <div style={{ background: '#fff1f1', border: `1px solid ${T.red}40`, borderRadius: '8px', padding: '8px 10px', marginBottom: '8px', fontSize: '11px', color: T.red, lineHeight: 1.5 }}>
                  ⛔ {itcBlock}
                </div>
              )}
              {!itcBlock && (
                <div style={{ background: T.tealBg, border: `1px solid ${T.teal}30`, borderRadius: '8px', padding: '7px 10px', marginBottom: '4px', fontSize: '11px', color: T.teal }}>
                  💡 {domainInfo.hint}
                </div>
              )}
            </>
          )}

          {/* ── Validating ── */}
          {phase === 'validating' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>🔍</div>
              <div style={{ color: T.text, fontSize: '14px', fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>Checking slot…</div>
              <div style={{ color: T.textMuted, fontSize: '11px', marginTop: '5px' }}>Spine · Domain · Rahu Kalam</div>
            </div>
          )}

          {/* ── Validation warning ── */}
          {phase === 'validation-warning' && warnings[currentWarn] && (
            <>
              <div style={{ background: '#fff8e6', border: `1px solid ${T.gold}50`, borderRadius: '10px', padding: '12px 14px', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: T.text, marginBottom: '5px', lineHeight: 1.4 }}>
                  {warnings[currentWarn].message}
                </div>
                <div style={{ fontSize: '11px', color: T.text2, lineHeight: 1.5 }}>
                  {warnings[currentWarn].suggestion}
                </div>
              </div>
              {warnings.length > 1 && (
                <div style={{ textAlign: 'center', fontSize: '10px', color: T.textMuted }}>
                  {currentWarn + 1} of {warnings.length} notices
                </div>
              )}
            </>
          )}

          {/* ── Astro confirm ── */}
          {phase === 'astro-confirm' && astro && (
            <>
              <div style={{ background: T.surface2, border: `1px solid ${verdictColor}40`, borderRadius: '10px', padding: '12px 14px', marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{astro.verdict}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: verdictColor, marginBottom: '3px' }}>
                  {astro.verdict === '✅' ? 'Auspicious' : astro.verdict === '⚠️' ? 'Unfavorable' : 'Neutral'}
                </div>
                <div style={{ fontSize: '11px', color: T.text2, lineHeight: 1.4 }}>{astro.note}</div>
              </div>
              <div style={{ fontSize: '11px', color: T.textMuted, textAlign: 'center', marginBottom: '4px' }}>
                {new Date(`${date}T${time}:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                {' · '}
                {new Date(`${date}T${time}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                {' · dh.kohli@gmail.com'}
              </div>
            </>
          )}

          {/* ── Writing ── */}
          {phase === 'writing' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '34px', marginBottom: '12px' }}>📅</div>
              <div style={{ color: T.text, fontSize: '15px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif" }}>Going to your Calendar…</div>
              <div style={{ color: T.textMuted, fontSize: '11px', marginTop: '6px' }}>Adding to dh.kohli@gmail.com</div>
            </div>
          )}

          {/* ── Success ── */}
          {phase === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
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
              <div style={{ color: T.text2, fontSize: '11px', marginBottom: '4px', lineHeight: 1.5 }}>{errorMsg}</div>
            </div>
          )}

        </div>

        {/* Button row — always visible, never inside scroll */}
        <Buttons />

        {/* Safe area spacer for iPhone home bar */}
        <div style={{ height: 'env(safe-area-inset-bottom, 12px)', flexShrink: 0 }} />

      </div>
    </div>
  )
}

// ── Shared button styles ──────────────────────────────────────────────────────
const btnRow = {
  display: 'flex', gap: '8px',
  padding: '12px 16px',
  borderTop: '1px solid rgba(0,0,0,0.06)',
  flexShrink: 0,
  background: T.surface,
}
const btnSecondary = {
  flex: 1, padding: '13px 10px',
  background: T.surface2, border: `1px solid ${T.border}`,
  borderRadius: '11px', color: T.text2,
  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
  fontFamily: "'Montserrat', system-ui, sans-serif",
}
const btnPrimary = {
  flex: 1, padding: '13px 10px',
  background: T.teal, border: 'none',
  borderRadius: '11px', color: '#fff',
  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
  fontFamily: "'Montserrat', system-ui, sans-serif",
}
