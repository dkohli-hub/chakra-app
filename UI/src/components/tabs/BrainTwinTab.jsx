import { useState } from 'react'
import { computeRajas, computeTamas, computeSattva, computeClutter, gunaLabel, agingDays } from '../../utils/scoring'
import { T } from '../../utils/theme'

function GunaTile({ label, value, color, punchline, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: T.surface, border: `1.5px solid ${color}40`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: '1rem', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ color, fontSize: '38px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1 }}>{value}%</div>
          </div>
          <span style={{ color: T.textMuted, fontSize: '12px', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginTop: '4px' }}>▶</span>
        </div>
        <div style={{ marginTop: '8px', height: '5px', background: T.borderLight, borderRadius: '2px' }}>
          <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
        </div>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: '0.75rem 1rem', background: T.surface2 }}>
          <p style={{ color: T.text2, fontSize: '11px', fontStyle: 'italic', marginBottom: '0.75rem' }}>{punchline}</p>
          {children}
        </div>
      )}
    </div>
  )
}

function HBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ color: T.text2, fontSize: '11px' }}>{label}</span>
        <span style={{ color, fontSize: '11px', fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: '6px', background: T.borderLight, borderRadius: '3px' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function BrainTwinTab({ tasks, loading }) {
  if (loading) return <p style={{ color: T.textMuted }}>Loading...</p>

  const rajas     = computeRajas(tasks)
  const tamas     = computeTamas(tasks)
  const sattva    = computeSattva(tasks)
  const clutter   = computeClutter(tasks)
  const narrative = gunaLabel(rajas, tamas, sattva)

  const active      = tasks.filter(t => !t.completed)
  const topHeavy    = active.filter(t => ['W4', 'W5'].includes(t.weightage)).slice(0, 5)
  const topStagnant = active.filter(t => ['Dhairya', 'Vishram', 'Manan', 'Manthan'].includes(t.bucket) && agingDays(t.entry_timestamp) > 14)
    .sort((a, b) => agingDays(b.entry_timestamp) - agingDays(a.entry_timestamp)).slice(0, 5)
  const topSattvic  = active.filter(t => ['Manan', 'Manthan'].includes(t.bucket)).slice(0, 5)

  const nudge = rajas > 60
    ? 'Move at least 2 heavy tasks to Vishram™ or Manthan™. Rest is strategy.'
    : tamas > 60
    ? 'Pick one stagnant task. Move it to Karya™ today. Motion breaks inertia.'
    : sattva > 60
    ? 'Beautiful clarity. Now act on one Manan™ insight before it fades.'
    : 'Your gunas are balanced. Continue with deliberate action.'

  function row(t, color) {
    return <div key={t.id} style={{ fontSize: '12px', color: T.text, padding: '3px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ color, fontSize: '10px', marginRight: '4px' }}>{t.weightage || t.bucket}</span>{t.title}
    </div>
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <GunaTile label="Rajas — Inertia of Motion" value={rajas} color="#B87800" punchline="These items are driving most of your mental activity.">
          {topHeavy.length ? topHeavy.map(t => row(t, '#B87800')) : <p style={{ color: T.textMuted, fontSize: '12px' }}>No heavy tasks.</p>}
        </GunaTile>

        <GunaTile label="Tamas — Inertia of Rest" value={tamas} color="#5A5A7A" punchline="These items have been waiting. Some may need a decision.">
          {topStagnant.length ? topStagnant.map(t => row(t, '#5A5A7A')) : <p style={{ color: T.textMuted, fontSize: '12px' }}>No stagnant items.</p>}
        </GunaTile>

        <GunaTile label="Sattva — Clarity of Thought" value={sattva} color="#2E7D32" punchline="Items in conscious contemplation — placed deliberately, not by default.">
          {topSattvic.length ? topSattvic.map(t => row(t, '#2E7D32')) : <p style={{ color: T.textMuted, fontSize: '12px' }}>No contemplation items.</p>}
        </GunaTile>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ color: T.goldText, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Load Distribution</div>
        <HBar label="Small (W1–W2)" value={clutter.small} color="#2E7D32" />
        <HBar label="Large (W3–W4)" value={clutter.large} color="#B87800" />
        <HBar label="Full day (W5)" value={clutter.huge} color={T.red} />
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ color: T.goldText, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>What Your Mind Is Saying</div>
        <p style={{ color: T.text2, fontSize: '13px', fontStyle: 'italic', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>"{narrative}"</p>
      </div>

      <div style={{ background: T.tealBg, border: `1px solid ${T.teal}40`, borderRadius: '10px', padding: '1rem' }}>
        <div style={{ color: T.teal, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>A Gentle Pointer</div>
        <p style={{ color: T.forest, fontSize: '13px', margin: 0 }}>{nudge}</p>
      </div>
    </div>
  )
}
