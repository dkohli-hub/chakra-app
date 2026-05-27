import { useState } from 'react'
import { T } from '../../utils/theme'

export default function QuickGatherFAB({ onAdd }) {
  const [open, setOpen]   = useState(false)
  const [text, setText]   = useState('')
  const [saving, setSaving] = useState(false)

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

  return (
    <>
      {/* FAB */}
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 900,
          cursor: 'pointer',
          width: '62px',
          height: '62px',
        }}
      >
        <img
          src="/logo.png"
          alt="Quick Gather"
          className="fab-spin"
          style={{
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: `3px solid ${T.gold}`,
            boxShadow: `0 6px 24px ${T.gold}55`,
            display: 'block',
          }}
        />
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,42,26,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: T.surface,
              borderRadius: '22px 22px 0 0',
              padding: '22px 20px 40px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 700, color: T.forest }}>Quick Gather</div>
                <div style={{ fontSize: '10px', color: T.text2, marginTop: '1px' }}>One task per line — added to Karya™</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '24px', lineHeight: 1 }}>✕</button>
            </div>

            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What is on your mind? Speak it."
              rows={4}
              style={{
                width: '100%',
                border: `1.5px solid ${T.border}`,
                borderRadius: '11px',
                padding: '13px',
                fontSize: '14px',
                fontFamily: "'Montserrat', system-ui, sans-serif",
                resize: 'none',
                background: T.surface2,
                outline: 'none',
                color: T.text,
                lineHeight: 1.6,
              }}
              onFocus={e => (e.target.style.borderColor = T.teal)}
              onBlur={e => (e.target.style.borderColor = T.border)}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={handleSave}
                disabled={saving || !text.trim()}
                style={{
                  flex: 1,
                  background: T.teal,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '11px',
                  padding: '13px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Montserrat', system-ui, sans-serif",
                  opacity: saving || !text.trim() ? 0.6 : 1,
                }}
              >
                {saving ? '⟳ Saving…' : 'Save to Chakra™'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px', color: T.textMuted }}>
              Advanced: include W3, "this week", or "today" in your text for auto-tagging in Gather
            </div>
          </div>
        </div>
      )}
    </>
  )
}
