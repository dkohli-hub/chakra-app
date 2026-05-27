import { useRef, useState } from 'react'
import { T } from '../../utils/theme'
import { MicButton } from '../tabs/GatherTab'

export default function QuickGatherFAB({ onAdd }) {
  const [open, setOpen]       = useState(false)
  const [text, setText]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const recognitionRef = useRef(null)

  async function handleSave() {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) return
    setSaving(true)
    for (const line of lines) {
      await onAdd({ title: line, bucket: 'Karya' })
    }
    setText('')
    setSaving(false)
    setOpen(false)
  }

  function handleClose() {
    recognitionRef.current?.stop()
    setListening(false)
    setVoiceError(null)
    setOpen(false)
  }

  function toggleVoice() {
    setVoiceError(null)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceError('Not supported. Use Chrome.'); return }

    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recognitionRef.current = rec

    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onerror  = (e) => {
      setVoiceError(e.error === 'not-allowed' ? 'Mic access denied.' : `Error: ${e.error}`)
      setListening(false)
    }
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim()
      setText(prev => prev ? prev + '\n' + transcript : transcript)
    }

    rec.start()
  }

  return (
    <>
      {/* FAB */}
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '22px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 900,
          cursor: 'pointer', width: '62px', height: '62px',
        }}
      >
        <img
          src="/logo.png"
          alt="Quick Gather"
          className="fab-spin"
          style={{
            width: '62px', height: '62px', borderRadius: '50%',
            objectFit: 'cover', border: `3px solid ${T.gold}`,
            boxShadow: `0 6px 24px ${T.gold}55`, display: 'block',
          }}
        />
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(26,42,26,0.65)', zIndex: 1000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '520px',
              background: T.surface, borderRadius: '22px 22px 0 0',
              padding: '22px 20px 40px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 700, color: T.forest }}>Quick Gather</div>
                <div style={{ fontSize: '10px', color: T.text2, marginTop: '1px' }}>One task per line — added to Karya™</div>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>✕</button>
            </div>

            {/* Textarea + mic */}
            <div style={{ position: 'relative' }}>
              <textarea
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={listening ? 'Listening… speak your task' : 'Type or tap the mic to speak your task'}
                rows={4}
                style={{
                  width: '100%', border: `1.5px solid ${listening ? T.teal : T.border}`,
                  borderRadius: '11px', padding: '13px 50px 13px 13px',
                  fontSize: '14px', fontFamily: "'Montserrat', system-ui, sans-serif",
                  resize: 'none', background: T.surface2,
                  outline: 'none', color: T.text, lineHeight: 1.6,
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
              />
              <MicButton
                listening={listening}
                onClick={toggleVoice}
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              />
            </div>

            {/* Voice status */}
            {(listening || voiceError) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '7px', padding: '7px 10px', borderRadius: '8px',
                background: voiceError ? T.redBg : T.tealBg,
                border: `1px solid ${voiceError ? T.red : T.teal}30`,
              }}>
                {listening && (
                  <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{
                        display: 'inline-block', width: '3px', borderRadius: '2px',
                        background: T.teal, height: i === 1 ? '14px' : '8px',
                        animation: `micBar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                      }} />
                    ))}
                  </span>
                )}
                <span style={{ fontSize: '11px', color: voiceError ? T.red : T.teal, fontWeight: 500 }}>
                  {voiceError || 'Listening… speak clearly, then pause'}
                </span>
              </div>
            )}

            {/* Save button */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={handleSave}
                disabled={saving || !text.trim()}
                style={{
                  flex: 1, background: T.teal, color: '#fff', border: 'none',
                  borderRadius: '11px', padding: '13px',
                  fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  opacity: saving || !text.trim() ? 0.55 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {saving ? '⟳ Saving…' : 'Save to Chakra™'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px', color: T.textMuted }}>
              Say keywords like <em>"W3"</em>, <em>"this week"</em>, <em>"today"</em> for auto-tagging in Gather
            </div>
          </div>
        </div>
      )}
    </>
  )
}
